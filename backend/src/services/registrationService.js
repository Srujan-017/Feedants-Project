const mongoose = require('mongoose');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const isValidObjectId = require('../utils/isValidObjectId');

function sanitizeRegistration(reg) {
  return {
    id: reg._id,
    competitionId: reg.competitionId,
    userId: reg.userId,
    registeredAt: reg.registeredAt,
    status: reg.status,
  };
}

/**
 * GET /api/competitions/:id/registration-status/:userId
 *
 * Decision (documented in README too): if the competition exists but
 * the given userId doesn't correspond to any User document, this
 * returns 404 rather than `{ registered: false }`. The caller is
 * asking about a specific identity the backend has no record of at
 * all, which is a different situation from "a real user who simply
 * hasn't registered" — and it avoids ever silently treating a typo'd
 * or fabricated userId as a valid (if unregistered) demo identity.
 */
async function getRegistrationStatus(competitionId, userId) {
  if (!isValidObjectId(competitionId)) {
    throw new ApiError(400, 'Invalid competition ID');
  }
  const competitionExists = await Competition.exists({ _id: competitionId });
  if (!competitionExists) {
    throw new ApiError(404, 'Competition not found');
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, 'Invalid user ID');
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const registration = await Registration.findOne({
    competitionId,
    userId,
    status: 'REGISTERED',
  });

  if (!registration) {
    return { registered: false };
  }

  return { registered: true, registration: sanitizeRegistration(registration) };
}

/**
 * POST /api/competitions/:id/register
 *
 * Concurrency + consistency design (hardened with a MongoDB
 * transaction — see README "Transaction implementation" for the full
 * write-up):
 *
 * 1. Cheap, session-free validation first (ObjectId format, missing
 *    userId) — no need to open a transaction just to reject obviously
 *    bad input.
 * 2. Everything else — competition/user existence, the duplicate
 *    check, the atomic capacity/lifecycle/deadline claim, and the
 *    Registration insert — runs inside ONE `session.withTransaction()`
 *    block. The atomic `findOneAndUpdate` (status/deadline/$expr
 *    capacity check + `$inc`) is still what actually prevents two
 *    concurrent requests from oversubscribing the last seat — the
 *    transaction's job is different: it guarantees that seat-claim and
 *    registration-insert either BOTH happen or NEITHER happens, even
 *    across a crash between the two writes. If anything inside the
 *    callback throws (not found, business-rule conflict, or a
 *    duplicate-key error on the insert), `withTransaction` aborts the
 *    whole transaction automatically — the `$inc` is rolled back by
 *    MongoDB itself, so no manual compensating `$inc: -1` is needed
 *    anymore. The transaction is now the sole mechanism keeping
 *    `Competition.bookedSpots` and the `registrations` collection
 *    consistent.
 *
 * Requires a MongoDB deployment that supports transactions (any Atlas
 * cluster, including the free M0 tier, since Atlas clusters are always
 * replica sets; a bare standalone `mongod` does not support them).
 */
async function registerUserForCompetition(competitionId, userId) {
  if (!isValidObjectId(competitionId)) {
    throw new ApiError(400, 'Invalid competition ID');
  }
  if (!userId) {
    throw new ApiError(400, 'userId is required');
  }
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, 'Invalid user ID');
  }

  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      const competitionExists = await Competition.exists({ _id: competitionId }).session(session);
      if (!competitionExists) {
        throw new ApiError(404, 'Competition not found');
      }

      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Fast-path duplicate check, read inside the transaction so it
      // sees a consistent snapshot. This is a defense-in-depth
      // optimization (avoids needlessly claiming-then-aborting in the
      // common case) — it is NOT what prevents duplicate registrations
      // under concurrency. That guarantee comes from the unique index,
      // enforced below when the Registration document is inserted.
      const alreadyRegistered = await Registration.exists({
        competitionId,
        userId,
        status: 'REGISTERED',
      }).session(session);
      if (alreadyRegistered) {
        throw new ApiError(409, 'User is already registered for this competition');
      }

      const now = new Date();

      // --- The atomic capacity + lifecycle + deadline claim ---
      // This single conditional update, executed within the
      // transaction's session, is the actual concurrency guarantee:
      // MongoDB evaluates the filter (status/deadline/$expr capacity
      // check) and applies the $inc as one atomic per-document
      // operation, so when N spots remain, at most N concurrent
      // transactions can ever have this call succeed.
      const claimedCompetition = await Competition.findOneAndUpdate(
        {
          _id: competitionId,
          status: 'REGISTRATION_OPEN',
          // The deadline is inclusive: registration is valid through the
          // exact deadline instant. A later server time is rejected.
          registrationDeadline: { $gte: now },
          $expr: { $lt: ['$bookedSpots', '$maxParticipants'] },
        },
        { $inc: { bookedSpots: 1 } },
        { new: true, session }
      );

      if (!claimedCompetition) {
        // The claim failed — read (no write) inside the same session
        // to report the specific reason.
        const competition = await Competition.findById(competitionId).session(session);
        if (!competition) {
          throw new ApiError(404, 'Competition not found');
        }
        if (competition.status !== 'REGISTRATION_OPEN') {
          throw new ApiError(
            409,
            `Registration is not open for this competition (current status: ${competition.status})`
          );
        }
        if (competition.registrationDeadline < now) {
          throw new ApiError(409, 'Registration deadline has passed');
        }
        if (competition.bookedSpots >= competition.maxParticipants) {
          throw new ApiError(409, 'Competition is full');
        }
        // Defensive fallback — should not normally be reachable.
        throw new ApiError(409, 'Registration could not be completed');
      }

      // --- Create the registration in the SAME session/transaction ---
      // No manual rollback here: if this throws (most importantly a
      // duplicate-key error, code 11000, from the same-user-twice race
      // described above), withTransaction aborts the whole transaction
      // for us, which undoes the $inc from the claim above automatically.
      let registration;
      try {
        registration = new Registration({ competitionId, userId, status: 'REGISTERED' });
        await registration.save({ session });
      } catch (err) {
        if (err && err.code === 11000) {
          throw new ApiError(409, 'User is already registered for this competition');
        }
        throw err;
      }

      result = {
        registration: sanitizeRegistration(registration),
        competition: {
          bookedSpots: claimedCompetition.bookedSpots,
          remainingSpots: claimedCompetition.maxParticipants - claimedCompetition.bookedSpots,
        },
      };
    });
  } finally {
    // Always end the session, whether the transaction committed,
    // aborted, or the callback threw before either happened.
    await session.endSession();
  }

  return result;
}

module.exports = { getRegistrationStatus, registerUserForCompetition };

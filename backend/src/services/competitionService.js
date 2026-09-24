const Competition = require('../models/Competition');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const isValidObjectId = require('../utils/isValidObjectId');

/**
 * Finds a competition by ID or throws the correct ApiError:
 * - 400 if the ID isn't a well-formed ObjectId (never let a Mongoose
 *   CastError reach the client).
 * - 404 if it's well-formed but no such competition exists.
 */
async function findCompetitionOrThrow(id) {
  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid competition ID');
  }

  const competition = await Competition.findById(id);
  if (!competition) {
    throw new ApiError(404, 'Competition not found');
  }

  return competition;
}

/**
 * Shapes a Competition Mongoose document into the public API response.
 * - remainingSpots is COMPUTED here, never read from a stored field
 *   (the schema doesn't have one) — this is the single place the
 *   frontend's "spots left" number comes from.
 * - Strips Mongoose's internal __v key. Nothing else on this document
 *   is sensitive, so no further field-by-field allow-listing is done.
 */
function toPublicCompetition(doc) {
  const obj = doc.toObject({ versionKey: false });
  const remainingSpots = Math.max(obj.maxParticipants - obj.bookedSpots, 0);

  return {
    id: obj._id,
    name: obj.name,
    slug: obj.slug,
    category: obj.category,
    type: obj.type,
    status: obj.status,
    prizePool: obj.prizePool,
    entryFee: obj.entryFee,
    maxParticipants: obj.maxParticipants,
    bookedSpots: obj.bookedSpots,
    remainingSpots,
    registrationDeadline: obj.registrationDeadline,
    submissionStart: obj.submissionStart,
    submissionEnd: obj.submissionEnd,
    resultDate: obj.resultDate,
    judge: obj.judge,
    previousWinners: obj.previousWinners,
    rewards: obj.rewards,
    aboutCompetition: obj.content?.aboutCompetition ?? [],
    judgingParameters: obj.content?.judgingParameters ?? [],
    rules: obj.content?.rules ?? [],
    eligibility: obj.content?.eligibility ?? [],
    disclaimer: obj.content?.disclaimer ?? '',
    refundPolicy: obj.content?.refundPolicy ?? '',
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

async function getCompetitionById(id) {
  const competition = await findCompetitionOrThrow(id);
  return toPublicCompetition(competition);
}

async function getWinnersByCompetitionId(id) {
  const competition = await findCompetitionOrThrow(id);
  const obj = competition.toObject({ versionKey: false });

  // An empty list is a perfectly normal, successful response — not
  // an error condition.
  return (obj.previousWinners || []).map((w) => ({
    id: w._id,
    name: w.name,
    position: w.position,
    imageUrl: w.imageUrl,
    videoUrl: w.videoUrl,
  }));
}

/**
 * Resolves the seeded IDs at runtime. The seed script recreates documents on
 * every run, so storing its ObjectIds in the mobile bundle would become stale.
 */
async function getDemoContext() {
  const [competition, demoUser] = await Promise.all([
    Competition.findOne({ slug: 'feedants-classical-dance' }),
    User.findOne({ email: 'demo@example.com' }),
  ]);

  if (!competition || !demoUser) {
    throw new ApiError(404, 'Demo data is unavailable. Run npm run seed first.');
  }

  return {
    competitionId: String(competition._id),
    demoUserId: String(demoUser._id),
  };
}

module.exports = {
  findCompetitionOrThrow,
  toPublicCompetition,
  getCompetitionById,
  getWinnersByCompetitionId,
  getDemoContext,
};

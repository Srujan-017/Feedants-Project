require('dotenv').config();

const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');
const Competition = require('../src/models/Competition');
const User = require('../src/models/User');
const Registration = require('../src/models/Registration');

/**
 * Builds a set of dates relative to "now" so the seeded competition is
 * always demonstrable, regardless of when this script is run — rather
 * than blindly reusing the (likely expired) dates shown in the original
 * design screenshot.
 *
 * The *relationship* between the dates is preserved from the reference
 * design (submissionStart -> registrationDeadline -> submissionEnd ->
 * resultDate, spaced 4 / 20 / 2 days apart respectively).
 */
function buildDemoDates() {
  const now = new Date();
  const addDays = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return {
    submissionStart: addDays(2), // demo assumption, see README
    registrationDeadline: addDays(6),
    submissionEnd: addDays(26),
    resultDate: addDays(28),
  };
}

async function seed() {
  await connectDB();

  const dates = buildDemoDates();

  // --- Competition -------------------------------------------------
  const competitionData = {
    name: 'Feedants Classical Dance',
    slug: 'feedants-classical-dance',
    category: 'Dance',
    type: 'Multi-Win',
    status: 'REGISTRATION_OPEN',
    prizePool: 1500,
    entryFee: 99,
    maxParticipants: 20,
    bookedSpots: 1, // must match the single seeded registration below
    registrationDeadline: dates.registrationDeadline,
    submissionStart: dates.submissionStart,
    submissionEnd: dates.submissionEnd,
    resultDate: dates.resultDate,
    judge: {
      name: 'Manju Dubey',
      profession: 'Professional Kathak Dancer',
      experience: '12+ Years of Experience',
      imageUrl: 'https://ui-avatars.com/api/?name=Manju+Dubey&background=007d86&color=ffffff&size=256&bold=true',
      introVideoUrl: '',
    },
    // DEMO DATA: the original design image shows example winner names,
    // but since these can't be confirmed as real, verified past Feedants
    // winners rather than mockup/placeholder content, they are seeded
    // here as clearly-labeled demo records.
    previousWinners: [
      { name: 'Riya Shah', position: 1, imageUrl: 'https://ui-avatars.com/api/?name=Riya+Shah&background=8b3d71&color=ffffff&size=256&bold=true' },
      { name: 'Aarav Mehta', position: 1, imageUrl: 'https://ui-avatars.com/api/?name=Aarav+Mehta&background=9b6a42&color=ffffff&size=256&bold=true' },
      { name: 'Neha Verma', position: 2, imageUrl: 'https://ui-avatars.com/api/?name=Neha+Verma&background=7b4d2b&color=ffffff&size=256&bold=true' },
    ],
    rewards: [
      { position: 1, label: '1st Winner', amount: 550 },
      { position: 2, label: '2nd Winner', amount: 300 },
      { position: 3, label: '3rd Winner', amount: 240 },
      { position: 4, label: '4th Winner', amount: 200 },
      { position: 5, label: '5th Winner', amount: 130 },
      { position: 6, label: '6th Winner', amount: 80 },
    ],
    content: {
      aboutCompetition: [
        'Showcase your classical dance skills in the Feedants Classical Dance competition.',
        'Open to solo performers; multiple winners will be recognized across positions.',
      ],
      judgingParameters: [
        'Technique and precision',
        'Expression and stage presence',
        'Adherence to classical form',
      ],
      rules: [
        'One submission per registered participant.',
        'Submissions must be original recordings.',
      ],
      eligibility: [
        'Open to all participants who complete registration before the deadline.',
      ],
      disclaimer: 'Only contributions from paid participants will be considered for judging.',
      refundPolicy: 'Entry fees are non-refundable once registration is confirmed (assignment-level assumption; no real payment gateway is implemented).',
    },
  };

  const demoEmail = 'demo@example.com';

  // --- Idempotent cleanup ------------------------------------------
  // Find each existing demo document FIRST (by the assignment's own
  // natural keys: slug / email), delete any Registration that
  // references its _id, THEN delete the document itself. Doing this
  // before creating the new competition/user (rather than after, by
  // the *new* _ids) is what prevents orphan Registration documents
  // from a previous run — a Registration's competitionId/userId
  // pointed at the OLD _id, which a delete-by-new-_id would never
  // match. This never touches any other collection or document.
  const existingCompetition = await Competition.findOne({ slug: competitionData.slug });
  if (existingCompetition) {
    await Registration.deleteMany({ competitionId: existingCompetition._id });
    await Competition.deleteOne({ _id: existingCompetition._id });
  }

  const existingUser = await User.findOne({ email: demoEmail });
  if (existingUser) {
    await Registration.deleteMany({ userId: existingUser._id });
    await User.deleteOne({ _id: existingUser._id });
  }

  // --- Create fresh demo data ---------------------------------------
  const competition = await Competition.create(competitionData);

  const user = await User.create({
    name: 'Demo User',
    email: demoEmail,
  });

  // Exactly one registration, matching competition.bookedSpots = 1, so
  // the seeded data is internally consistent. No pre-delete needed
  // here — competition and user are freshly created above, so no
  // registration can already reference their (brand new) _ids.
  const registration = await Registration.create({
    competitionId: competition._id,
    userId: user._id,
    status: 'REGISTERED',
  });

  console.log('--- Seed complete ---');
  console.log(`Competition: "${competition.name}" (slug: ${competition.slug}, _id: ${competition._id})`);
  console.log(`  maxParticipants=${competition.maxParticipants}, bookedSpots=${competition.bookedSpots}`);
  console.log(`  previousWinners: ${competition.previousWinners.length}, rewards: ${competition.rewards.length}`);
  console.log(`User: "${user.name}" <${user.email}> (_id: ${user._id})`);
  console.log(`Registration: _id=${registration._id}, status=${registration.status}`);
  console.log('---------------------');

  await mongoose.disconnect();
  console.log('Disconnected. Seeding finished successfully.');
}

seed().catch((err) => {
  console.error('[Seed] failed:', err.message);
  process.exit(1);
});

/**
 * Phase 6 — Concurrency Test: Last-Seat Registration
 *
 * Verifies that when two users simultaneously attempt to register for the
 * last available seat, exactly ONE succeeds and bookedSpots never exceeds
 * maxParticipants.
 *
 * This test requires direct MongoDB access so it can set up a controlled
 * competition state before the race. It uses the project's existing Mongoose
 * models via the backend's db.js config.
 *
 * Usage:
 *   cd backend
 *   MONGO_URI="<your MongoDB Atlas connection string>" node test/concurrency-registration.js
 *
 * Or set MONGO_URI in backend/.env and the script will load it via dotenv.
 *
 * The test creates its own isolated documents (prefixed "PHASE6_TEST_") and
 * removes them on completion — it does NOT touch the seeded production data.
 */

require('dotenv').config();

const mongoose = require('mongoose');

// ── Models (loaded directly — no need to start the Express server) ────────────
const Competition = require('../src/models/Competition');
const User = require('../src/models/User');
const Registration = require('../src/models/Registration');

// ── HTTP helper (hits the running Express API) ────────────────────────────────
const http = require('http');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

function httpPost(path, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// ── Test setup ─────────────────────────────────────────────────────────────────
const TEST_PREFIX = 'PHASE6_TEST_';

async function cleanup(competitionSlug, emails) {
  const comp = await Competition.findOne({ slug: competitionSlug });
  if (comp) {
    await Registration.deleteMany({ competitionId: comp._id });
    await Competition.deleteOne({ _id: comp._id });
  }
  if (emails.length) {
    const users = await User.find({ email: { $in: emails } });
    await Registration.deleteMany({ userId: { $in: users.map(u => u._id) } });
    await User.deleteMany({ email: { $in: emails } });
  }
}

async function run() {
  console.log('Phase 6 — Concurrency: Last-Seat Registration Test');
  console.log('='.repeat(55));

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('\nERROR: MONGO_URI is not set.');
    console.error('  Create backend/.env with MONGO_URI=... and retry.\n');
    process.exit(1);
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('  Connected to MongoDB\n');

  const testSlug = `${TEST_PREFIX}concurrency-${Date.now()}`;
  const emailA = `${TEST_PREFIX}userA-${Date.now()}@test.local`;
  const emailB = `${TEST_PREFIX}userB-${Date.now()}@test.local`;

  let competitionId, userAId, userBId;

  try {
    // ── 1. Create isolated test competition ──────────────────────────────────
    const now = new Date();
    const future = (days) => new Date(now.getTime() + days * 86_400_000);

    const comp = await Competition.create({
      name: `${TEST_PREFIX}Classical Dance`,
      slug: testSlug,
      category: 'Dance',
      type: 'Multi-Win',
      status: 'REGISTRATION_OPEN',
      prizePool: 1500,
      entryFee: 99,
      maxParticipants: 20,
      bookedSpots: 19,               // ← 19/20 — exactly ONE seat left
      registrationDeadline: future(5),
      submissionStart: future(6),
      submissionEnd: future(10),
      resultDate: future(12),
      judge: {
        name: 'Test Judge',
        profession: 'Test Profession',
        experience: '1 Year',
      },
    });
    competitionId = comp._id.toString();
    console.log(`  Competition created: ${comp.name} (${competitionId})`);
    console.log(`  Initial: bookedSpots=${comp.bookedSpots}, maxParticipants=${comp.maxParticipants}`);
    console.log(`  ONE seat remaining.\n`);

    // ── 2. Create two test users ─────────────────────────────────────────────
    const [userA, userB] = await User.insertMany([
      { name: `${TEST_PREFIX}User A`, email: emailA },
      { name: `${TEST_PREFIX}User B`, email: emailB },
    ]);
    userAId = userA._id.toString();
    userBId = userB._id.toString();
    console.log(`  User A: ${userAId}`);
    console.log(`  User B: ${userBId}\n`);

    // ── 3. Fire two simultaneous registration requests ───────────────────────
    console.log('  Firing two concurrent registration requests...');
    const [resA, resB] = await Promise.all([
      httpPost(`/competitions/${competitionId}/register`, { userId: userAId }),
      httpPost(`/competitions/${competitionId}/register`, { userId: userBId }),
    ]);

    console.log(`  User A → HTTP ${resA.status} — ${resA.body?.message || JSON.stringify(resA.body)}`);
    console.log(`  User B → HTTP ${resB.status} — ${resB.body?.message || JSON.stringify(resB.body)}`);

    // ── 4. Evaluate results ──────────────────────────────────────────────────
    const successCount = [resA, resB].filter(r => r.status === 201).length;
    const failCount    = [resA, resB].filter(r => r.status !== 201).length;

    console.log('');
    if (successCount === 1 && failCount === 1) {
      console.log('  ✓ PASS  Exactly one request succeeded and one failed — as expected.');
    } else if (successCount === 2) {
      console.error('  ✗ FAIL  BOTH requests succeeded — race condition detected!');
      process.exitCode = 1;
    } else if (successCount === 0) {
      console.error('  ✗ FAIL  Both requests failed — registration may be misconfigured.');
      process.exitCode = 1;
    }

    // ── 5. Verify database state ─────────────────────────────────────────────
    const fresh = await Competition.findById(competitionId);
    console.log(`\n  DB check: bookedSpots = ${fresh.bookedSpots} (expected 20)`);

    if (fresh.bookedSpots === 20) {
      console.log('  ✓ PASS  bookedSpots = 20 — no over-booking.');
    } else {
      console.error(`  ✗ FAIL  bookedSpots = ${fresh.bookedSpots} — invariant violated!`);
      process.exitCode = 1;
    }

    if (fresh.bookedSpots > fresh.maxParticipants) {
      console.error(`  ✗ FAIL  bookedSpots (${fresh.bookedSpots}) > maxParticipants (${fresh.maxParticipants}) — CRITICAL`);
      process.exitCode = 1;
    } else {
      console.log('  ✓ PASS  bookedSpots ≤ maxParticipants invariant holds.');
    }

    // ── 6. Verify exactly one Registration document was created ──────────────
    const registrationCount = await Registration.countDocuments({ competitionId: fresh._id });
    console.log(`\n  DB check: Registration documents = ${registrationCount} (expected 1)`);

    if (registrationCount === 1) {
      console.log('  ✓ PASS  Exactly one Registration document created.');
    } else if (registrationCount === 0) {
      console.error('  ✗ FAIL  No Registration document was created — unexpected.');
      process.exitCode = 1;
    } else {
      console.error(`  ✗ FAIL  ${registrationCount} Registration documents created — race condition!`);
      process.exitCode = 1;
    }

  } finally {
    // ── 7. Clean up test data ────────────────────────────────────────────────
    await cleanup(testSlug, [emailA, emailB]);
    console.log('\n  Test data cleaned up.');
    await mongoose.disconnect();
  }

  console.log('\n' + '='.repeat(55));
  if (process.exitCode) {
    console.error('CONCURRENCY TEST FAILED — see above.');
  } else {
    console.log('CONCURRENCY TEST PASSED — atomic seat claim is working correctly.');
  }
}

run().catch((err) => {
  console.error('\nUnhandled error:', err.message);
  process.exit(1);
});

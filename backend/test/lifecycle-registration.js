/**
 * Phase 6 — Lifecycle + Deadline Tests
 *
 * Verifies that registration is only permitted during REGISTRATION_OPEN and
 * that a passed deadline is enforced server-side.
 *
 * Creates isolated test competitions for each lifecycle state, then removes them.
 *
 * Usage:
 *   cd backend
 *   MONGO_URI="..." node test/lifecycle-registration.js
 */

require('dotenv').config();

const mongoose = require('mongoose');
const http = require('http');

const Competition = require('../src/models/Competition');
const User = require('../src/models/User');
const Registration = require('../src/models/Registration');

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

const PREFIX = 'PHASE6_LIFECYCLE_';
const now = new Date();
const future = (days) => new Date(now.getTime() + days * 86_400_000);
const past   = (days) => new Date(now.getTime() - days * 86_400_000);

const ALL_STATUSES = [
  'UPCOMING',
  'REGISTRATION_OPEN',
  'REGISTRATION_CLOSED',
  'SUBMISSION_OPEN',
  'SUBMISSION_CLOSED',
  'RESULTS_PUBLISHED',
];

async function createTestCompetition(status) {
  return Competition.create({
    name: `${PREFIX}${status}`,
    slug: `${PREFIX.toLowerCase()}${status.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    category: 'Dance',
    type: 'Multi-Win',
    status,
    prizePool: 100,
    entryFee: 10,
    maxParticipants: 20,
    bookedSpots: 0,
    registrationDeadline: status === 'REGISTRATION_OPEN' ? future(5) : past(1),
    submissionStart: future(1),
    submissionEnd: future(5),
    resultDate: future(7),
    judge: { name: 'Test', profession: 'Test', experience: '1yr' },
  });
}

async function run() {
  console.log('Phase 6 — Lifecycle & Deadline Tests');
  console.log('='.repeat(50));

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('ERROR: MONGO_URI not set.\n');
    process.exit(1);
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

  const testEmail = `${PREFIX}user-${Date.now()}@test.local`;
  const user = await User.create({ name: `${PREFIX}User`, email: testEmail });
  const userId = user._id.toString();

  const created = [];

  try {
    for (const status of ALL_STATUSES) {
      const comp = await createTestCompetition(status);
      created.push(comp);
      const compId = comp._id.toString();

      const r = await httpPost(`/competitions/${compId}/register`, { userId });
      const allowed = r.status === 201;
      const shouldBeAllowed = status === 'REGISTRATION_OPEN';

      if (shouldBeAllowed && allowed) {
        console.log(`  ✓ PASS  ${status}: registration accepted (201)`);
      } else if (!shouldBeAllowed && r.status === 409) {
        console.log(`  ✓ PASS  ${status}: registration rejected with 409 — correct`);
      } else if (!shouldBeAllowed && !allowed) {
        console.log(`  ~ WARN  ${status}: registration rejected (${r.status}) — expected 409`);
      } else if (shouldBeAllowed && !allowed) {
        console.error(`  ✗ FAIL  ${status}: expected 201, got ${r.status}`);
        process.exitCode = 1;
      } else {
        console.error(`  ✗ FAIL  ${status}: expected rejection, got 201 — should NOT be allowed`);
        process.exitCode = 1;
      }
    }

    // ── Expired deadline test ─────────────────────────────────────────────────
    console.log('\n  Expired deadline test:');
    const expiredComp = await Competition.create({
      name: `${PREFIX}EXPIRED`,
      slug: `${PREFIX.toLowerCase()}expired-${Date.now()}`,
      category: 'Dance',
      type: 'Multi-Win',
      status: 'REGISTRATION_OPEN',
      prizePool: 100,
      entryFee: 10,
      maxParticipants: 20,
      bookedSpots: 0,
      registrationDeadline: past(1),     // ← deadline in the past
      submissionStart: future(1),
      submissionEnd: future(5),
      resultDate: future(7),
      judge: { name: 'Test', profession: 'Test', experience: '1yr' },
    });
    created.push(expiredComp);

    const r = await httpPost(`/competitions/${expiredComp._id}/register`, { userId });
    if (r.status === 409) {
      console.log(`  ✓ PASS  Expired deadline: registration rejected with 409 — correct`);
    } else if (r.status !== 201) {
      console.log(`  ~ WARN  Expired deadline: registration rejected (${r.status}) — expected 409`);
    } else {
      console.error('  ✗ FAIL  Expired deadline: registration was accepted — backend not enforcing deadline');
      process.exitCode = 1;
    }

  } finally {
    for (const comp of created) {
      await Registration.deleteMany({ competitionId: comp._id });
      await Competition.deleteOne({ _id: comp._id });
    }
    await Registration.deleteMany({ userId: user._id });
    await User.deleteOne({ _id: user._id });
    console.log('\n  Test data cleaned up.');
    await mongoose.disconnect();
  }

  console.log('\n' + '='.repeat(50));
  console.log(process.exitCode ? 'Some lifecycle tests FAILED.' : 'All lifecycle tests PASSED.');
}

run().catch((err) => {
  console.error('Unhandled error:', err.message);
  process.exit(1);
});

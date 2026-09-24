/**
 * Phase 6 — Edge Case Tests
 *
 * Read-only tests use the seeded COMPETITION_ID / USER_ID.
 * Mutation tests (duplicate registration) use fully isolated PHASE6_EDGE_DUP_ data
 * that is created and cleaned up within this script — never touching production data.
 *
 * Usage:
 *   cd backend
 *   MONGO_URI="..." COMPETITION_ID=<id> USER_ID=<id> node test/edge-cases.js
 *
 * MONGO_URI is required only for the isolated duplicate-registration test.
 * If MONGO_URI is absent that section is skipped gracefully.
 */

require('dotenv').config();

const { api, pass, fail, skip, section, assert } = require('./helpers');

const COMPETITION_ID = process.env.COMPETITION_ID;
const USER_ID = process.env.USER_ID;

const FAKE_OID   = '000000000000000000000001';
const INVALID_ID = 'not-a-valid-id';

// ── Mongoose (used only for isolated mutation tests) ──────────────────────────
let mongoose, Competition, User, Registration;
async function connectDB() {
  if (!process.env.MONGO_URI) return false;
  mongoose    = require('mongoose');
  Competition = require('../src/models/Competition');
  User        = require('../src/models/User');
  Registration = require('../src/models/Registration');
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  return true;
}

const PREFIX  = 'PHASE6_EDGE_DUP_';
const future  = (days) => new Date(Date.now() + days * 86_400_000);

async function run() {
  console.log('Phase 6 — Edge Case Tests');
  console.log('='.repeat(55));

  if (!COMPETITION_ID || !USER_ID) {
    console.error('\nERROR: Set COMPETITION_ID and USER_ID (from seed output).\n');
    process.exit(1);
  }

  // ── Health ──────────────────────────────────────────────────────────────────
  section('Health Endpoints');
  {
    const r = await api.get('/health').catch(() => null);
    if (!r) fail('GET /api/health reachable', 'connection refused');
    else assert(r.status === 200 && r.body.success, 'GET /api/health → 200', 'GET /api/health failed');
  }
  {
    const r = await api.get('/health/db').catch(() => null);
    if (!r) fail('GET /api/health/db reachable');
    else assert(r.status === 200 && r.body.success, 'GET /api/health/db → 200 (DB healthy)', 'DB health failed');
  }

  // ── Fetch competition (read-only, uses seeded data) ─────────────────────────
  section('GET /api/competitions/:id (read-only)');
  {
    const r = await api.get(`/competitions/${COMPETITION_ID}`);
    assert(r.status === 200, 'Valid competition → 200', `Got ${r.status}`);
    const d = r.body.data;
    assert(d && d.name, 'Has name', 'Missing name');
    assert(typeof d.remainingSpots === 'number', 'Has remainingSpots', 'Missing remainingSpots');
    assert(Array.isArray(d.rewards), 'Has rewards array', 'Missing rewards');
    assert(d.judge && d.judge.name, 'Has judge', 'Missing judge');
    assert(
      d.remainingSpots === d.maxParticipants - d.bookedSpots,
      `remainingSpots = maxParticipants - bookedSpots (${d.remainingSpots} = ${d.maxParticipants} - ${d.bookedSpots})`,
      'remainingSpots calculation wrong'
    );
  }
  {
    const r = await api.get(`/competitions/${FAKE_OID}`);
    assert(r.status === 404, 'Unknown competition → 404', `Got ${r.status}`);
  }
  {
    const r = await api.get(`/competitions/${INVALID_ID}`);
    assert(r.status === 400, 'Invalid ID → 400', `Got ${r.status}`);
    assert(!r.body.success, 'success=false', 'Expected success=false');
  }

  // ── Winners (read-only) ────────────────────────────────────────────────────
  section('GET /api/competitions/:id/winners (read-only)');
  {
    const r = await api.get(`/competitions/${COMPETITION_ID}/winners`);
    assert(r.status === 200, 'Valid competition → 200', `Got ${r.status}`);
    assert(Array.isArray(r.body.data), 'Response data is an array', 'Not an array');
  }
  {
    const r = await api.get(`/competitions/${FAKE_OID}/winners`);
    assert(r.status === 404, 'Unknown competition → 404', `Got ${r.status}`);
  }
  {
    const r = await api.get(`/competitions/${INVALID_ID}/winners`);
    assert(r.status === 400, 'Invalid ID → 400', `Got ${r.status}`);
  }

  // ── Registration status (read-only) ────────────────────────────────────────
  section('GET registration-status (read-only)');
  {
    const r = await api.get(`/competitions/${COMPETITION_ID}/registration-status/${USER_ID}`);
    assert(r.status === 200, 'Valid IDs → 200', `Got ${r.status}`);
    assert(typeof r.body.data?.registered === 'boolean', 'registered is boolean', 'Missing registered');
  }
  {
    const r = await api.get(`/competitions/${COMPETITION_ID}/registration-status/${FAKE_OID}`);
    assert(r.status === 404 || r.status === 200, 'Unknown user → 404 or handled', `Got ${r.status}`);
  }
  {
    const r = await api.get(`/competitions/${COMPETITION_ID}/registration-status/${INVALID_ID}`);
    assert(r.status === 400, 'Invalid user ID → 400', `Got ${r.status}`);
  }
  {
    const r = await api.get(`/competitions/${FAKE_OID}/registration-status/${USER_ID}`);
    assert(r.status === 404, 'Unknown competition → 404', `Got ${r.status}`);
  }

  // ── Registration POST — bad bodies (read-only, no state change) ─────────────
  section('POST /register — Bad Request Bodies');
  {
    const r = await api.post(`/competitions/${COMPETITION_ID}/register`, {});
    assert(r.status >= 400, 'Empty body → 4xx', `Got ${r.status}`);
  }
  {
    const r = await api.post(`/competitions/${COMPETITION_ID}/register`, { userId: INVALID_ID });
    assert(r.status === 400, 'Invalid userId → 400', `Got ${r.status}`);
  }
  {
    const r = await api.post(`/competitions/${COMPETITION_ID}/register`, { userId: FAKE_OID });
    assert(r.status === 404, 'Non-existent userId → 404', `Got ${r.status}`);
  }
  {
    const r = await api.post(`/competitions/${FAKE_OID}/register`, { userId: USER_ID });
    assert(r.status === 404, 'Non-existent competition → 404', `Got ${r.status}`);
  }
  {
    const r = await api.post(`/competitions/${INVALID_ID}/register`, { userId: USER_ID });
    assert(r.status === 400, 'Invalid competition ID → 400', `Got ${r.status}`);
  }

  // ── Duplicate Registration — ISOLATED TEST DATA ─────────────────────────────
  section('Duplicate Registration (isolated — PHASE6_EDGE_DUP_ data)');

  const dbAvailable = await connectDB().catch(() => false);

  if (!dbAvailable) {
    skip('Duplicate test skipped — MONGO_URI not set (set it to enable this test)');
  } else {
    const slug    = `${PREFIX.toLowerCase()}dup-${Date.now()}`;
    const email   = `${PREFIX}user-${Date.now()}@test.local`;
    let comp, user;
    try {
      // 1. Create isolated competition
      comp = await Competition.create({
        name: `${PREFIX}Dup Test`,
        slug,
        category: 'Dance',
        type: 'Multi-Win',
        status: 'REGISTRATION_OPEN',
        prizePool: 100,
        entryFee: 10,
        maxParticipants: 20,
        bookedSpots: 0,
        registrationDeadline: future(5),
        submissionStart: future(6),
        submissionEnd: future(10),
        resultDate: future(12),
        judge: { name: 'Test Judge', profession: 'Test', experience: '1yr' },
      });

      // 2. Create isolated user
      user = await User.create({ name: `${PREFIX}User`, email });

      const compId = comp._id.toString();
      const userId = user._id.toString();

      // 3. First registration — must succeed
      const r1 = await api.post(`/competitions/${compId}/register`, { userId });
      assert(r1.status === 201, 'First registration → 201', `Got ${r1.status}: ${JSON.stringify(r1.body)}`);

      // 4. Second registration — must be 409
      const r2 = await api.post(`/competitions/${compId}/register`, { userId });
      assert(r2.status === 409, 'Second (duplicate) registration → 409', `Got ${r2.status}`);
      assert(!r2.body.success, 'Duplicate: success=false', 'Expected success=false');

      // 5. Verify exactly ONE Registration document
      const regCount = await Registration.countDocuments({ competitionId: comp._id });
      assert(regCount === 1, `Exactly 1 Registration document (got ${regCount})`, `Got ${regCount} documents`);

      // 6. Verify bookedSpots increased exactly once
      const fresh = await Competition.findById(comp._id);
      assert(fresh.bookedSpots === 1, `bookedSpots = 1 after one registration (got ${fresh.bookedSpots})`, `Got ${fresh.bookedSpots}`);

    } finally {
      if (comp) {
        await Registration.deleteMany({ competitionId: comp._id });
        await Competition.deleteOne({ _id: comp._id });
      }
      if (user) {
        await Registration.deleteMany({ userId: user._id });
        await User.deleteOne({ _id: user._id });
      }
    }

    await mongoose.disconnect();
  }

  // ── bookedSpots invariant (read-only) ──────────────────────────────────────
  section('bookedSpots Invariant (seeded competition)');
  {
    const r = await api.get(`/competitions/${COMPETITION_ID}`);
    const d = r.body.data;
    assert(
      d.bookedSpots >= 0 && d.bookedSpots <= d.maxParticipants,
      `bookedSpots (${d.bookedSpots}) within [0, ${d.maxParticipants}]`,
      `Invariant violated: ${d.bookedSpots} / ${d.maxParticipants}`
    );
  }

  console.log('\n' + '='.repeat(55));
  console.log(process.exitCode ? 'Some tests FAILED.' : 'All executed tests PASSED.');
}

run().catch((err) => {
  console.error('\nUnhandled error:', err.message);
  process.exit(1);
});

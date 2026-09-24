/**
 * Phase 6 — Full Competition Test
 *
 * Sets up a competition with 0 seats remaining and verifies registration is rejected.
 *
 * Usage:
 *   cd backend
 *   MONGO_URI="..." node test/full-competition.js
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
      hostname: url.hostname, port: url.port || 80, path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
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

const PREFIX = 'PHASE6_FULL_';
const future = (days) => new Date(Date.now() + days * 86_400_000);

async function run() {
  console.log('Phase 6 — Full Competition Test');
  console.log('='.repeat(50));

  if (!process.env.MONGO_URI) { console.error('ERROR: MONGO_URI not set.'); process.exit(1); }
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });

  const slug = `${PREFIX.toLowerCase()}${Date.now()}`;
  const email = `${PREFIX}user-${Date.now()}@test.local`;

  let comp, user;
  try {
    comp = await Competition.create({
      name: `${PREFIX}Dance`, slug,
      category: 'Dance', type: 'Multi-Win', status: 'REGISTRATION_OPEN',
      prizePool: 100, entryFee: 10, maxParticipants: 20, bookedSpots: 20,  // ← FULL
      registrationDeadline: future(5), submissionStart: future(6),
      submissionEnd: future(10), resultDate: future(12),
      judge: { name: 'Test', profession: 'Test', experience: '1yr' },
    });
    user = await User.create({ name: `${PREFIX}User`, email });

    console.log(`  Competition: FULL (bookedSpots=${comp.bookedSpots}/${comp.maxParticipants})`);

    const r = await httpPost(`/competitions/${comp._id}/register`, { userId: user._id.toString() });

    if (r.status === 409) {
      console.log('  ✓ PASS  Full competition: registration rejected with 409 — correct');
    } else if (r.status !== 201) {
      console.log(`  ~ WARN  Full competition: registration rejected (${r.status}) — expected 409`);
    } else {
      console.error('  ✗ FAIL  Full competition was allowed — atomic guard not working!');
      process.exitCode = 1;
    }

    // Verify bookedSpots didn't increase
    const fresh = await Competition.findById(comp._id);
    if (fresh.bookedSpots === 20) {
      console.log('  ✓ PASS  bookedSpots unchanged (still 20)');
    } else {
      console.error(`  ✗ FAIL  bookedSpots changed to ${fresh.bookedSpots} — over-booking!`);
      process.exitCode = 1;
    }

    // Verify no Registration document was created
    const count = await Registration.countDocuments({ competitionId: comp._id });
    if (count === 0) {
      console.log('  ✓ PASS  No Registration document created for full competition');
    } else {
      console.error(`  ✗ FAIL  ${count} Registration document(s) created for full competition`);
      process.exitCode = 1;
    }

  } finally {
    if (comp) {
      await Registration.deleteMany({ competitionId: comp._id });
      await Competition.deleteOne({ _id: comp._id });
    }
    if (user) {
      await Registration.deleteMany({ userId: user._id });
      await User.deleteOne({ _id: user._id });
    }
    console.log('  Test data cleaned up.');
    await mongoose.disconnect();
  }

  console.log('\n' + '='.repeat(50));
  console.log(process.exitCode ? 'Full competition test FAILED.' : 'Full competition test PASSED.');
}

run().catch(err => { console.error('Error:', err.message); process.exit(1); });

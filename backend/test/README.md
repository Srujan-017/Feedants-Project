# Backend Test Suite

## Prerequisites

1. **MongoDB** — running and accessible via `MONGO_URI` (e.g. MongoDB Atlas M0 free tier)
2. **`backend/.env`** — must contain `MONGO_URI`
3. **Express server running** — `npm run dev` in `backend/` (required for HTTP-based tests)
4. **Seed data** — run `npm run seed` first

> If any prerequisite is unavailable, mark results **NOT VERIFIED** rather than fabricating results.

## Environment Variables

| Variable | Required by | Description |
|---|---|---|
| `MONGO_URI` | All tests | MongoDB Atlas connection string |
| `API_BASE_URL` | All tests | Defaults to `http://localhost:5000/api` |

## Running Tests

All commands run from the `backend/` directory.

### Edge Case Tests

Tests health endpoints, invalid/unknown IDs, and an isolated duplicate-registration scenario. Read-only tests resolve the latest seed documents from `/api/competitions/demo-context`. The duplicate-registration test creates its own isolated `PHASE6_EDGE_DUP_` competition and user and cleans up in `finally`.

```bash
cd backend
npm run test:edge
# With explicit MONGO_URI (required for the isolated duplicate test):
MONGO_URI="<your MongoDB Atlas connection string>" npm run test:edge
```

**Covers:**
- `GET /api/health` → 200
- `GET /api/health/db` → 200
- GET competition with valid ID → 200, verifies `remainingSpots` calculation
- GET competition with unknown ObjectId → 404
- GET competition with invalid ID format → 400
- GET winners (valid, unknown, invalid IDs)
- GET registration-status (valid, unknown user, invalid IDs)
- POST register with missing/invalid/unknown body fields → 400/404
- POST duplicate registration using isolated test data → first 201, second 409
- Verify exactly 1 Registration document after duplicate attempt
- Verify `bookedSpots` incremented exactly once
- `bookedSpots` invariant on seeded competition

### Concurrency Test (Last-Seat Race)

Creates an isolated `PHASE6_TEST_` competition with `maxParticipants=20, bookedSpots=19` and two `PHASE6_TEST_` users. Fires both registrations simultaneously via `Promise.all`. Verifies exactly one 201, one conflict, and `bookedSpots === 20`. Cleans up in `finally`.

```bash
cd backend
npm run test:concurrency
# Or with explicit URI:
MONGO_URI="<your MongoDB Atlas connection string>" npm run test:concurrency
```

**Expected outcome:**
- One request → 201 Created
- One request → 409 (or equivalent conflict)
- Final `bookedSpots` = 20 (never 21)
- Exactly 1 Registration document

### Lifecycle + Deadline Tests

Creates isolated `PHASE6_LIFECYCLE_` competitions for all 6 status values, plus an additional competition with `status=REGISTRATION_OPEN` but a past deadline. Verifies registration is only accepted for the correct case.

```bash
cd backend
npm run test:lifecycle
```

**Expected outcome:**
- `REGISTRATION_OPEN` + future deadline → 201
- All other statuses → non-201 (rejection)
- `REGISTRATION_OPEN` + past deadline → non-201 (deadline enforced server-side)

### Full Competition Test

Creates an isolated `PHASE6_FULL_` competition with `bookedSpots === maxParticipants`. Verifies registration is rejected, `bookedSpots` is unchanged, and no Registration document is created.

```bash
cd backend
npm run test:full
```

**Expected outcome:**
- Registration → non-201 (rejected)
- `bookedSpots` unchanged at `maxParticipants`
- 0 Registration documents created

## Test Data Safety

- All test scripts create documents with a phase-specific prefix (`PHASE6_TEST_`, `PHASE6_LIFECYCLE_`, `PHASE6_FULL_`, `PHASE6_EDGE_DUP_`)
- Every script cleans up its own documents in a `finally` block — cleanup runs regardless of pass/fail
- Seeded production data is **never modified** by test scripts
- The seeded competition and Demo User are used only for **read-only** HTTP tests in `edge-cases.js`

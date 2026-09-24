# Feedants Competition Module

## Project Overview

This repository is being built for the **Feedants Full Stack Development
Internship Technical Assignment**. The full assignment is a "Competition
Details" mobile screen backed by a real API and database (not a static UI):
users see live competition information (prize pool, entry fee, remaining
spots), a live countdown to the registration deadline, previous winners, and
can register for a competition — with the backend enforcing that
registrations never exceed capacity, even under concurrent requests.

This repo is built in phases. **This phase only covers the backend
foundation** (server, DB connection, health checks). Competition/registration
logic, the winners API, and the React Native UI are intentionally not built
yet — see "Future Phases" below.

## Tech Stack

**Frontend** (added in a later phase)
- React Native
- Expo

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB (MongoDB Atlas for development)

## Current Phase

**Phase 3 — Backend APIs and Business Logic** (Phase 1 backend foundation
and Phase 2 database models/seed data complete and verified)

## Project Structure

```
feedants-fullstack-assignment/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # Mongoose connection + status helper
│   │   ├── controllers/            # empty — Phase 2
│   │   ├── middleware/
│   │   │   └── errorMiddleware.js  # 404 handler + centralized error handler
│   │   ├── models/                 # empty — Phase 2
│   │   ├── routes/
│   │   │   └── healthRoutes.js     # /api/health and /api/health/db
│   │   ├── services/               # empty — Phase 2
│   │   └── server.js               # Express app entrypoint
│   ├── .env                        # YOU create this locally (never committed)
│   ├── .env.example                # committed placeholder/format
│   ├── .gitignore
│   └── package.json
│
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js (LTS recommended)
- npm
- Git
- A MongoDB Atlas account (free tier is fine for development)

## Installation

```bash
cd backend
npm install
```

## Environment Variables

Create `backend/.env` (this file is git-ignored and must never be committed):

```
PORT=5000
MONGO_URI=your_real_mongodb_connection_string
```

See `backend/.env.example` for the expected **format** of `MONGO_URI` — it
contains no real credentials.

⚠️ If your MongoDB password contains special URL characters
(`@ : / ? # [ ] %`), it must be URL-encoded inside the connection string.

## Running Backend

```bash
cd backend
npm run dev
```

The server will only start listening once it has successfully connected to
MongoDB. If the connection fails, it logs the error and exits rather than
running an API that can't reach the database.

## API Health Check

- `GET /api/health` — process liveness check, does not touch MongoDB.
  ```json
  { "success": true, "message": "Feedants API is running" }
  ```
- `GET /api/health/db` — checks the actual current Mongoose connection
  state. Returns HTTP 503 if MongoDB is not connected.
  ```json
  { "success": true, "message": "Database connection is healthy", "state": "connected" }
  ```

## MongoDB Setup

1. Create a free MongoDB Atlas account/project and a development cluster.
2. Create a database user with a strong password.
3. Allow network access appropriate for local development.
4. Copy the connection string Atlas gives you and put it into
   `backend/.env` as `MONGO_URI`, using `feedants_competition` (or similar)
   as the database name.
5. Never put the real connection string in this README, in Git, or in any
   chat log.

## Security

- `.env` is git-ignored at both the root and `backend/` level; only
  `.env.example` (with placeholder values) is tracked.
- `helmet` and `cors` are enabled on the Express app.
- No credentials are ever logged; `backend/src/config/db.js` logs only the
  resolved host and database name, never the connection string.
- Centralized error handling avoids leaking stack traces to API responses.

## Phase 1 Completion

- [x] Backend project initialized (`npm init`)
- [x] Core dependencies installed: express, mongoose, cors, dotenv, helmet
- [x] Dev dependency installed: nodemon
- [x] Modular architecture (`config/`, `controllers/`, `middleware/`,
      `models/`, `routes/`, `services/`)
- [x] `connectDB()` implemented with clear failure behavior
- [x] `GET /api/health` implemented
- [x] `GET /api/health/db` implemented (checks real connection state)
- [x] Centralized error handler + 404 handler
- [x] `.env.example` committed, `.env` git-ignored
- [x] Root and backend `.gitignore` configured
- [x] MongoDB Atlas connection **verified end-to-end** locally (confirmed
      working: server start, `/api/health`, `/api/health/db`)

## Assumptions / Technical Decisions / Trade-offs

- **No authentication in Phase 1.** The assignment doesn't require full
  auth; a demo user identity will be introduced when registration logic is
  built, and this will be documented explicitly at that point.
- **MongoDB Atlas over local MongoDB**, to avoid environment-specific setup
  issues during development/assessment.
- **Server refuses to listen until MongoDB connects**, so a broken DB
  connection is never silently masked by a "working" API.
- **MongoDB Atlas connection, seeding, and Phase 1/2 functionality all
  verified locally** by the project owner: `npm install`, `npm run dev`,
  `/api/health`, `/api/health/db`, `npm run seed` (including the
  idempotent re-run fix), and the resulting database counts. Phase 3's
  API code — including the transaction-hardened registration flow —
  has been syntax-checked and manually traced in this environment (no
  network access here — see "Testing instructions" under Phase 3 for
  what still needs to run locally, including the transaction's
  requirement that `MONGO_URI` point at a replica set).

## Phase 2 — Database Models & Seed Data

### Architecture

- **`Competition`** — one document per competition. `judge`, `previousWinners`,
  and `rewards` are **embedded** (not separate collections), because all
  three are 1:1 or 1:many-but-always-read-with a single competition and
  are never queried independently in this assignment's scope. Content
  sections (`aboutCompetition`, `judgingParameters`, `rules`,
  `eligibility`) are string arrays rather than one large blob, since the
  UI renders them as lists.
- **`User`** — a separate, intentionally minimal collection (no
  authentication fields). Exists only so `Registration` has a real user
  to reference instead of a fake frontend-only identity.
- **`Registration`** — a separate collection (not embedded in
  `Competition`), because it must be queryable independently (e.g. "has
  this user registered?") and because Phase 3's atomic,
  concurrency-safe registration logic will operate on a `Registration`
  document together with `Competition.bookedSpots`.
- **No derived `remainingSpots` field is stored anywhere** — it is always
  computed as `maxParticipants - bookedSpots` at read time, so it can
  never drift out of sync.

### Indexes

| Collection | Index | Why |
|---|---|---|
| Competition | `slug` (unique) | primary lookup key for a competition page |
| Competition | `status` | filtering/listing by lifecycle state |
| Competition | `registrationDeadline` | Phase 3's deadline/expiry checks |
| User | `email` (unique) | prevents duplicate demo/user accounts |
| Registration | `{ competitionId, userId }` (**unique compound**) | **critical**: enforced at the database level so a user can never end up with two registrations for the same competition, even under concurrent requests |
| Registration | `competitionId` | "all registrations for competition X" |
| Registration | `userId` | "all competitions user X registered for" |

### Validation highlights

- `Competition.maxParticipants > 0`, `bookedSpots >= 0`,
  `bookedSpots <= maxParticipants`.
- `Competition.prizePool`, `entryFee`, reward `amount` are all
  non-negative `Number`s (never strings).
- `Competition.status` is restricted to one canonical enum:
  `UPCOMING`, `REGISTRATION_OPEN`, `REGISTRATION_CLOSED`,
  `SUBMISSION_OPEN`, `SUBMISSION_CLOSED`, `RESULTS_PUBLISHED`.
- `User.email` is required, lowercased, unique, and format-validated.
- `Registration.status` is restricted to `REGISTERED` / `CANCELLED`.
- All date fields (`registrationDeadline`, `submissionStart`,
  `submissionEnd`, `resultDate`) are real `Date` values, not display
  strings — the frontend formats them, and the future countdown
  computes `registrationDeadline - now`.

### Seed data (`backend/seed/seed.js`)

Run with:

```bash
cd backend
npm run seed
```

Inserts, consistently with each other:

- **1 Competition** — "Feedants Classical Dance" (Dance / Multi-Win,
  ₹1,500 prize pool, ₹99 entry fee, 20 max participants, 1 booked spot,
  6 reward tiers, 3 demo winners, judge Manju Dubey).
- **1 User** — `demo@example.com` / "Demo User" (not a real email).
- **1 Registration** — Demo User → Feedants Classical Dance, so
  `bookedSpots (1)` exactly matches the number of seeded registrations.

**Date assumption:** the original design screenshot's dates (e.g. "10 Aug
26") would already be in the past by the time this is run/graded, which
would make the competition impossible to demonstrate. The seed script
therefore generates dates **relative to when it's run** (`submissionStart`
= now + 2 days, `registrationDeadline` = now + 6 days, `submissionEnd` =
now + 26 days, `resultDate` = now + 28 days), preserving the same
day-spacing and ordering as the original design.

**Winner-name assumption:** the example winner names visible in the
supplied design image cannot be confirmed as real, verified Feedants
competition winners rather than placeholder/mockup content. To avoid
misattributing invented data to real people, seeded winners are
explicitly labeled demo records ("Demo Winner 1/2/3") rather than reusing
those names.

The seed script only ever touches its own documents — it deletes (by
`slug` / `email`, not a blanket collection wipe) and re-inserts exactly
the records above, so it's safe to re-run and never touches unrelated
data.

**Idempotency fix:** an earlier version of this script deleted the
Competition/User *before* cleaning up their Registration, which meant a
re-run created a new Competition/User with new `_id`s while the
Registration from the previous run — still pointing at the old, now
non-existent `_id`s — was never removed (it was only ever deleted by
matching the *new* `_id`s, which can't match an old orphan). The script
now looks up the existing Competition/User by their natural keys
(`slug` / `email`) first, deletes any Registration referencing that
existing `_id`, and only then deletes the Competition/User itself and
creates fresh records. Running `npm run seed` any number of times in a
row now always leaves exactly one Competition, one User, and one
Registration, with no orphans.

### Verifying seeded data

YOUR ACTION REQUIRED — after running `npm run seed`, verify in MongoDB
(Atlas UI "Browse Collections", or `mongosh` connected with your own
`MONGO_URI`, or MongoDB Compass):

```js
use feedants_competition   // or your configured DB name
show collections
db.competitions.countDocuments()          // expect 1
db.competitions.findOne({ slug: "feedants-classical-dance" })
db.users.countDocuments()                 // expect 1
db.registrations.countDocuments()         // expect 1
db.registrations.getIndexes()             // confirm the unique compound index
```

None of these require pasting your connection string or password anywhere.

### Phase 2 boundary

- Authentication is **not** implemented (Phase 2 or overall — documented
  assumption).
- No competition/registration REST APIs yet — that's Phase 3 (see below).
- No React Native UI yet — that's Phase 4.
- No payment/Razorpay integration.

## Phase 3 — Backend APIs & Business Logic

### Architecture

```
routes  →  controllers  →  services  →  models
```

Controllers stay thin (validate the shape of the request, call a
service, send the response). All business logic — lifecycle checks,
the deadline check, the atomic capacity claim, duplicate-registration
handling — lives in the service layer:

```
backend/src/
├── controllers/
│   ├── competitionController.js    # getCompetition, getWinners
│   └── registrationController.js   # getRegistrationStatus, registerUser
├── services/
│   ├── competitionService.js       # lookups + response shaping (remainingSpots computed here)
│   └── registrationService.js      # registration status + the atomic register operation
├── routes/
│   ├── healthRoutes.js             # unchanged from Phase 1
│   ├── competitionRoutes.js        # GET /:id, GET /:id/winners; mounts registrationRoutes under /:id
│   └── registrationRoutes.js       # GET /registration-status/:userId, POST /register (mergeParams: true)
├── utils/
│   ├── ApiError.js                 # error class carrying an HTTP status code
│   ├── asyncHandler.js             # forwards rejected promises to the error middleware
│   └── isValidObjectId.js          # strict 24-hex-char ObjectId format check
└── middleware/errorMiddleware.js   # extended with generic CastError / duplicate-key mappings
```

### Endpoints

**1. `GET /api/competitions/:id`**
Returns the full competition document, publicly shaped (see below).
- `400` — malformed `:id`
- `404` — no competition with that ID
- `200` — `{ "success": true, "data": { ...competition } }`

`data` includes: `id, name, slug, category, type, status, prizePool,
entryFee, maxParticipants, bookedSpots, remainingSpots,
registrationDeadline, submissionStart, submissionEnd, resultDate, judge,
previousWinners, rewards, aboutCompetition, judgingParameters, rules,
eligibility, disclaimer, refundPolicy, createdAt, updatedAt`.

`remainingSpots` is **computed on every request** as
`maxParticipants - bookedSpots` — it is never stored, and a client can
never influence it.

```bash
curl http://localhost:5000/api/competitions/<competitionId>
```
```json
{
  "success": true,
  "data": {
    "id": "...", "name": "Feedants Classical Dance", "status": "REGISTRATION_OPEN",
    "maxParticipants": 20, "bookedSpots": 1, "remainingSpots": 19,
    "judge": { "name": "Manju Dubey", "profession": "Professional Kathak Dancer", "...": "..." },
    "...": "..."
  }
}
```

**2. `GET /api/competitions/:id/winners`**
- `400` — malformed `:id`
- `404` — no competition with that ID
- `200` — `{ "success": true, "data": [ { id, name, position, imageUrl, videoUrl }, ... ] }` (an empty array is a normal, successful response, not an error)

**3. `GET /api/competitions/:id/registration-status/:userId`**
- `400` — malformed `:id` or `:userId`
- `404` — competition not found, **or** `:userId` doesn't match any User document (see "Design decisions" below)
- `200` — `{ "success": true, "data": { "registered": false } }` or `{ "success": true, "data": { "registered": true, "registration": { id, competitionId, userId, registeredAt, status } } }`

**4. `POST /api/competitions/:id/register`**
Body: `{ "userId": "<demo user's ObjectId>" }`
- `400` — malformed `:id`, missing `userId`, or malformed `userId`
- `404` — competition not found, or user not found
- `409` — already registered / competition not `REGISTRATION_OPEN` / deadline passed / competition full
- `201` — `{ "success": true, "message": "Registration successful", "data": { "registration": {...}, "competition": { "bookedSpots": N, "remainingSpots": M } } }`

```bash
curl -X POST http://localhost:5000/api/competitions/<competitionId>/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"<userId>"}'
```

### Business rules enforced (in `registrationService.registerUserForCompetition`)

1. Competition ID is a valid ObjectId and the competition exists.
2. `userId` is present, a valid ObjectId, and the User exists (never auto-created).
3. User is not already registered (fast-path check + DB-level guarantee — see below).
4. `competition.status === 'REGISTRATION_OPEN'` — every other lifecycle value is rejected with `409`.
5. `competition.registrationDeadline > now`, checked **on the server**, independent of the lifecycle status and never trusting the frontend countdown.
6. `competition.bookedSpots < competition.maxParticipants`.
7. Exactly one `Registration` document is created and `bookedSpots` is incremented by exactly one — or neither happens at all.

### Atomic last-seat registration + transaction — how it actually works

**Hardening update:** registration now runs inside a real MongoDB
transaction (`mongoose.startSession()` + `session.withTransaction()`),
replacing the earlier version's manual compensating rollback. The two
mechanisms solve two different problems, and both are still present:

1. **The atomic conditional update is still what prevents overselling.**
   A **single** `findOneAndUpdate`, executed inside the transaction's
   session, is the only thing that decides whether a seat is available:
   ```js
   Competition.findOneAndUpdate(
     {
       _id: competitionId,
       status: 'REGISTRATION_OPEN',
       registrationDeadline: { $gt: now },
       $expr: { $lt: ['$bookedSpots', '$maxParticipants'] },
     },
     { $inc: { bookedSpots: 1 } },
     { new: true, session }
   )
   ```
   MongoDB evaluates the filter and applies the `$inc` as one atomic
   operation on that document. If two requests arrive for the true
   last spot, only one of them can match `$expr: { $lt: [...] }`
   before the increment lands — the other's filter no longer matches
   and it gets `null` back. **This is still the actual concurrency
   guarantee** — the transaction wrapped around it does not change
   this property at all.
2. **The transaction is what prevents inconsistency between the seat
   claim and the registration insert.** Both operations — the
   `findOneAndUpdate` above and the `Registration.save()` that follows
   — run inside the same `session`/transaction. If the registration
   insert fails for any reason (most importantly a duplicate-key error,
   code `11000`, from the unique `(competitionId, userId)` index — e.g.
   the *same* user's two simultaneous requests both passing the
   earlier fast-path "already registered?" check and both reaching the
   insert), the whole callback throws, `session.withTransaction()`
   **aborts the transaction automatically**, and MongoDB itself undoes
   the `$inc` from step 1. **No manual `$inc: -1` rollback is written
   anymore** — the transaction is the sole mechanism keeping
   `Competition.bookedSpots` and the `registrations` collection
   consistent, including across a hypothetical process crash between
   the two writes.
3. If the claim fails (`null` returned) inside the transaction, a
   **read-only** follow-up query (still using the same session) works
   out the precise reason (not found / wrong status / deadline passed
   / full) purely to produce a clear error message — it doesn't affect
   correctness, since the atomic step already made the real decision.
4. The `session` is always ended in a `finally` block, whether the
   transaction committed, aborted, or the callback threw before either
   happened.

**Requires a replica-set-backed MongoDB deployment** — any MongoDB
Atlas cluster (including the free M0 tier, which is always a 3-node
replica set) supports multi-document transactions. A bare standalone
`mongod` does not; if you ever run this against one for local testing
without Atlas, `session.startTransaction()` will fail.

### Design decisions worth documenting

- **Validation order for `POST /register`:** competition-ID format → competition exists → `userId` format/presence → user exists → duplicate check → atomic claim. The competition (the primary resource in the URL) is checked before the user, so a request with both a nonexistent competition and a nonexistent user gets a "Competition not found" 404, not a "User not found" 404.
- **`registration-status` for an unknown `userId`:** returns `404 User not found` rather than `{ registered: false }` — see the docstring in `registrationService.js` for the reasoning (a request about an identity the backend has no record of is different from a real, unregistered user).
- **Demo identity, no authentication:** `userId` in the request body is a plain demo identity (the seeded `demo@example.com` User's `_id`) — there is no login, session, or token. This is an explicit, documented simplification for the assignment, not an oversight.
- **No payment integration:** the design's Razorpay/payment UI is not backed by any real payment logic here — entry fee is informational only.

### Error handling

| Status | Used for |
|---|---|
| 400 | Malformed ObjectId, missing required field |
| 404 | Competition not found, User not found |
| 409 | Already registered, wrong lifecycle status, deadline passed, competition full, generic duplicate-key |
| 500 | Truly unexpected errors only — no stack trace, connection string, or internal detail is ever included in the response |

The existing centralized `errorMiddleware.js` (Phase 1) handles all of this — services throw `ApiError(statusCode, message)`, controllers are wrapped in `asyncHandler` so any thrown/rejected error reaches the middleware automatically, and the middleware was extended with two generic fallbacks (Mongoose `CastError` → 400, duplicate-key `11000` → 409) as defense-in-depth in case something reaches it that a service didn't already classify.

### Testing instructions

YOUR ACTION REQUIRED — run these locally (this build environment has no
network access, so none of this has been executed against a live
database; see the audit note below). **Note:** registration now uses a
MongoDB transaction, which requires your `MONGO_URI` to point at a
replica set — any MongoDB Atlas cluster (including the free M0 tier)
qualifies automatically; a bare standalone local `mongod` does not.

```bash
cd backend
npm install
npm run seed
npm run dev
```

Then, using the competition `_id` and demo user `_id` printed by `npm run seed`:

```bash
# 1. Health checks (must still work, unchanged from Phase 1)
curl http://localhost:5000/api/health
curl http://localhost:5000/api/health/db

# 2. Get competition
curl http://localhost:5000/api/competitions/<competitionId>

# 3. Get winners
curl http://localhost:5000/api/competitions/<competitionId>/winners

# 4. Registration status for the ALREADY-seeded demo user (expect registered: true)
curl http://localhost:5000/api/competitions/<competitionId>/registration-status/<userId>

# 5. Duplicate registration attempt for that same seeded user (expect 409)
curl -i -X POST http://localhost:5000/api/competitions/<competitionId>/register \
  -H "Content-Type: application/json" -d "{\"userId\":\"<userId>\"}"

# 6. Invalid competition ID (expect 400)
curl -i http://localhost:5000/api/competitions/not-a-valid-id

# 7. Nonexistent but well-formed competition ID (expect 404)
curl -i http://localhost:5000/api/competitions/64b000000000000000000000

# 8. Missing userId on register (expect 400)
curl -i -X POST http://localhost:5000/api/competitions/<competitionId>/register \
  -H "Content-Type: application/json" -d "{}"
```

To exercise a **fresh, successful** registration (not a duplicate), create a
second demo user directly in Mongo (or temporarily extend the seed
script) and register with that user's `_id` instead — do not reuse the
seeded registration for a "new registration succeeds" test.

**Concurrency test (documented here, to be actually executed in Phase 6
per the project plan):** create/seed a competition with
`maxParticipants: 20, bookedSpots: 19, status: 'REGISTRATION_OPEN'`, a
future `registrationDeadline`, and no existing registration for two
specific test users A and B. Fire both requests as close together as
possible, e.g.:

```bash
curl -s -o /tmp/a.json -w "%{http_code}\n" -X POST http://localhost:5000/api/competitions/<id>/register -H "Content-Type: application/json" -d '{"userId":"<userA>"}' &
curl -s -o /tmp/b.json -w "%{http_code}\n" -X POST http://localhost:5000/api/competitions/<id>/register -H "Content-Type: application/json" -d '{"userId":"<userB>"}' &
wait
```

Expected: one `201`, one `409`. Then verify in the database (not just the
HTTP responses) that `bookedSpots === 20` and exactly one new
`Registration` document exists for that competition (per the two users).
Use a dedicated test competition for this, not the main seeded one, so
the primary demo data isn't disturbed.

### Limitations / assumptions carried into Phase 3

- Authentication is intentionally simplified to a demo `userId` — documented above, not an oversight.
- Payment processing (Razorpay) is not implemented.
- The React Native frontend does not exist yet (Phase 4).
- The concurrency test above is documented and the implementation is atomic by design, but an actual automated concurrent-load test run is deferred to Phase 6 per the project plan.

## Future Phases

- **Phase 4** — React Native (Expo) UI matching the supplied design.
- **Phase 5** — Frontend ↔ backend integration, dynamic state (countdown,
  spots remaining, registration state).
- **Phase 6** — Edge-case, concurrency, and duplicate-registration testing.
- **Phase 7** — Polish, final README, GitHub submission, screen recording.

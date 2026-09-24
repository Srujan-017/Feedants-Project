# Feedants Backend

Node.js + Express + MongoDB REST API for the Feedants Classical Dance competition platform.

## Structure

```
backend/
├── src/
│   ├── config/db.js                    ← Mongoose connection
│   ├── controllers/                    ← Route handlers (thin; delegate to services)
│   ├── middleware/errorMiddleware.js    ← Centralized error handling
│   ├── models/                         ← Competition, Registration, User schemas
│   ├── routes/                         ← Express routers
│   ├── services/                       ← Business logic + atomic seat-claim
│   ├── utils/                          ← ApiError, asyncHandler, isValidObjectId
│   └── server.js
├── seed/seed.js                        ← Seeds demo competition + demo user
├── test/                               ← Phase 6 test suite (see test/README.md)
├── .env.example
├── package.json
└── README.md
```

## Setup

```bash
cd backend
npm install
cp .env.example .env     # fill in MONGO_URI
npm run seed             # prints COMPETITION_ID and USER_ID — save these
npm run dev              # http://localhost:5000
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `PORT` | No | Server port (default `5000`) |
| `NODE_ENV` | No | `development` / `production` |

**Never hardcode credentials.** `backend/.env` is gitignored.

## npm Scripts

| Script | Command | Description |
|---|---|---|
| `start` | `node src/server.js` | Production start |
| `dev` | `nodemon src/server.js` | Development with hot reload |
| `seed` | `node seed/seed.js` | Seed demo data |
| `test:edge` | `node test/edge-cases.js` | Edge case + health tests |
| `test:concurrency` | `node test/concurrency-registration.js` | Last-seat race test |
| `test:lifecycle` | `node test/lifecycle-registration.js` | Lifecycle + deadline tests |
| `test:full` | `node test/full-competition.js` | Full capacity rejection test |

## API Routes

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Server health |
| GET | `/api/health/db` | MongoDB connection health |
| GET | `/api/competitions/:id` | Competition details + computed `remainingSpots` |
| GET | `/api/competitions/:id/winners` | Previous winners array |
| GET | `/api/competitions/:id/registration-status/:userId` | Registration status for user |
| POST | `/api/competitions/:id/register` | Register user — body: `{ userId }` |

All responses: `{ success: true|false, data: ... }` or `{ success: false, message: "..." }`.

## Key Design Notes

### Atomic capacity claim
`findOneAndUpdate` with `status === REGISTRATION_OPEN`, `registrationDeadline > now`, and `$expr: { $lt: ['$bookedSpots', '$maxParticipants'] }` combined with `$inc: { bookedSpots: 1 }` — evaluated atomically by MongoDB. Prevents over-booking under concurrent requests.

### MongoDB transaction
The seat-claim `$inc` and the Registration document insert run inside `session.withTransaction()`. If the insert fails (e.g. duplicate-key from the unique index), the transaction is aborted automatically and the `$inc` is rolled back — no manual compensating write.

### Unique compound index
`Registration.index({ competitionId: 1, userId: 1 }, { unique: true })` — database-level guarantee that a user cannot have two active registrations for the same competition.

### Server-side lifecycle + deadline
Both `status` and `registrationDeadline` are checked inside the atomic query filter. The frontend is never trusted to enforce eligibility.

### remainingSpots
Computed as `maxParticipants - bookedSpots` at read time in `competitionService.js`. Never stored in the database to prevent drift.

## Testing

See [`test/README.md`](test/README.md) for full prerequisites and usage.

> Tests require a live MongoDB connection and a running Express server. If running in a restricted environment, mark results **NOT VERIFIED** rather than fabricating results.

# Feedants Competition Details — Full Stack Assignment

> Feedants Full Stack Development Internship Technical Assignment

---

## 1. Project Overview

This project implements the **Feedants Classical Dance** competition details experience as a full-stack mobile application:

```
React Native / Expo (mobile UI)
         ↓  REST API
Node.js + Express (backend)
         ↓  Mongoose ODM
MongoDB Atlas (database)
```

The mobile app fetches all competition data from the backend API. Nothing is hardcoded in the mobile application — competition details, winners, registration state, and seat availability are all served from the database.

---

## 2. Repository Structure

```
feedants-fullstack-assignment/
├── backend/              ← Node.js + Express + MongoDB API (Phases 1–3 & 6)
│   ├── src/
│   │   ├── config/       ← Mongoose connection
│   │   ├── controllers/  ← Route handlers (thin, delegate to services)
│   │   ├── middleware/   ← Centralized error handling
│   │   ├── models/       ← Competition, Registration, User schemas
│   │   ├── routes/       ← Express routers
│   │   ├── services/     ← Business logic + atomic seat-claim
│   │   ├── utils/        ← ApiError, asyncHandler, isValidObjectId
│   │   └── server.js
│   ├── seed/seed.js      ← Seeds demo competition + demo user
│   ├── test/             ← Phase 6 test suite
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── mobile/               ← React Native / Expo app (Phases 4–5)
│   ├── assets/           ← App icon
│   ├── src/
│   │   ├── components/   ← All screen components
│   │   ├── screens/      ← CompetitionDetailsScreen
│   │   ├── services/     ← API layer + shape mapper
│   │   ├── hooks/        ← useCountdown
│   │   └── constants/    ← theme, API config
│   ├── App.js
│   ├── app.json
│   └── package.json
│
├── docs/
│   ├── SCREEN_RECORDING_SCRIPT.md
│   └── FINAL_SUBMISSION_CHECKLIST.md
│
└── README.md             ← This file
```

---

## 3. Features

| Feature | Implementation |
|---|---|
| Competition details (name, category, type, prize pool, entry fee) | Dynamic — from MongoDB |
| Remaining spots | Server-computed: `maxParticipants - bookedSpots` |
| Judge information | Dynamic — from MongoDB |
| Countdown timer | Client-side countdown to registration deadline |
| Important dates | Dynamic — registration deadline, submission window, result date |
| Previous winners | Dynamic — fetched from `/winners` endpoint |
| Rewards / prize tiers | Dynamic — from MongoDB |
| About / Judging / Rules & Eligibility tabs | Dynamic — from MongoDB |
| Disclaimer & Refund Policy | Dynamic — from MongoDB |
| Registration button | Calls POST `/register`; updates state from API response |
| Spots update after registration | Re-fetches competition data after successful registration |
| Duplicate registration protection | 409 from backend; unique compound index on DB |
| Full competition handling | 409 from backend; atomic capacity guard |
| Expired deadline handling | 409 from backend; deadline enforced server-side |
| Lifecycle state enforcement | Backend validates `status === REGISTRATION_OPEN` |
| Loading states | Spinner shown during all API calls |
| Error states | Error message + Retry button |
| Empty winners state | Handled gracefully in UI |
| Secure Payment UI | UI element per design; real payment flow outside scope |
| Refer & Earn UI | UI element per design |
| Testimonials | Static mock data (no backend testimonials endpoint) |
| Upload Submission UI | UI element; active only during `SUBMISSION_OPEN`; media pipeline outside scope |
| Bottom navigation | UI element per design |

---

## 4. Architecture

### Mobile (React Native / Expo)
- Renders the Competition Details screen
- Calls backend REST APIs with `Promise.all` for parallel loading
- Maps flat backend response fields to nested component-friendly shape via `toCompetition()` in `competitionService.js`
- Manages loading, error, and registration states
- Countdown display only — never authority for registration eligibility

### Backend (Node.js + Express)
- Validates all input (ObjectId format, required fields)
- Enforces competition lifecycle: only `REGISTRATION_OPEN` + deadline not yet passed
- Handles capacity atomically (see Concurrency section below)
- Returns consistent `{ success, data }` envelope
- Centralized error middleware with proper HTTP status codes

### MongoDB Atlas
- **competitions** — competition document with embedded judge, winners, rewards, content
- **users** — user identity (demo user seeded for assignment)
- **registrations** — one document per user-competition pair; compound unique index

---

## 5. Database Design

### Competition
| Field | Type | Notes |
|---|---|---|
| `name` | String | Display name |
| `slug` | String | URL-friendly identifier, unique |
| `status` | String (enum) | One of the 6 lifecycle states |
| `maxParticipants` | Number | Total capacity |
| `bookedSpots` | Number | Atomically incremented on registration |
| `registrationDeadline` | Date | Enforced server-side |
| `judge` | Embedded | Name, profession, experience |
| `previousWinners` | Array | Embedded winner documents |
| `rewards` | Array | Prize tiers |
| `content` | Object | About, judgingParameters, rules, eligibility, disclaimer, refundPolicy |

### User
| Field | Type | Notes |
|---|---|---|
| `name` | String | Display name |
| `email` | String | Unique |

### Registration
| Field | Type | Notes |
|---|---|---|
| `competitionId` | ObjectId → Competition | |
| `userId` | ObjectId → User | |
| `registeredAt` | Date | Defaults to `Date.now` |
| `status` | String (enum) | `REGISTERED` or `CANCELLED` |

**Unique compound index:** `{ competitionId: 1, userId: 1 }` — enforced at the database level so a user can never have two registration documents for the same competition, even under concurrent requests. If two identical registrations race, one succeeds and the other gets a duplicate-key error (code 11000) which is caught and returned as 409.

---

## 6. Concurrency Design

### The Last-Seat Problem

Consider 20 total spots, 19 already booked. User A and User B click Register simultaneously. A naive read-then-update flow would let both read `bookedSpots = 19`, both see a free spot, and both write `bookedSpots = 20` — but two Registration documents also get created, producing an effective `bookedSpots = 21`.

### Solution: Atomic Conditional Capacity Claim

The backend uses a single `findOneAndUpdate` call with a compound filter that includes a capacity check:

```js
Competition.findOneAndUpdate(
  {
    _id: competitionId,
    status: 'REGISTRATION_OPEN',
    registrationDeadline: { $gt: now },
    $expr: { $lt: ['$bookedSpots', '$maxParticipants'] },  // ← atomic guard
  },
  { $inc: { bookedSpots: 1 } },
  { new: true, session }
)
```

MongoDB evaluates the filter and applies the `$inc` as one atomic per-document operation. When only 1 spot remains, at most 1 concurrent call can have this succeed — the others see no matching document and return nothing.

### Transaction Consistency

The seat-claim increment and the Registration document insert run inside `session.withTransaction()`:

1. `findOneAndUpdate` claims the seat atomically (within the session)
2. `Registration.save({ session })` creates the registration document
3. If step 2 throws (e.g. duplicate-key error from the unique index), `withTransaction` automatically aborts the transaction and rolls back the `$inc` from step 1 — no manual compensating write needed

This guarantees that `bookedSpots` and the `registrations` collection are always consistent: if a registration document does not exist, the corresponding `bookedSpots` increment was never committed.

> Requires a MongoDB replica set (e.g. any Atlas cluster, including the free M0 tier).

---

## 7. Competition Lifecycle

```
UPCOMING → REGISTRATION_OPEN → REGISTRATION_CLOSED
                                      ↓
                               SUBMISSION_OPEN → SUBMISSION_CLOSED
                                                        ↓
                                               RESULTS_PUBLISHED
```

| Status | Registration Allowed |
|---|---|
| `UPCOMING` | No |
| `REGISTRATION_OPEN` | Yes — if deadline not yet passed |
| `REGISTRATION_CLOSED` | No |
| `SUBMISSION_OPEN` | No |
| `SUBMISSION_CLOSED` | No |
| `RESULTS_PUBLISHED` | No |

**The backend is the sole authority.** The frontend countdown timer is a display convenience only — the server re-validates status and deadline on every registration attempt.

---

## 8. API Reference

### GET `/api/health`
Server health check.
- **200** `{ success: true, message: "Feedants API is running" }`

### GET `/api/health/db`
MongoDB connection health check.
- **200** `{ success: true, message: "Database connection is healthy", state: "connected" }`
- **503** `{ success: false, message: "Database connection is not healthy", state: "<state>" }` if DB is unreachable

### GET `/api/competitions/:id`
Fetch full competition details.
- **`:id`** — MongoDB ObjectId of the competition
- **200** `{ success: true, data: { ...competitionFields, remainingSpots } }`
  - `remainingSpots` is server-computed as `maxParticipants - bookedSpots`
- **400** — invalid ObjectId format
- **404** — competition not found

### GET `/api/competitions/:id/winners`
Fetch previous winners for a competition.
- **200** `{ success: true, data: [ { name, position, imageUrl, videoUrl }, ... ] }`
- **400** — invalid ObjectId
- **404** — competition not found

### GET `/api/competitions/:id/registration-status/:userId`
Check whether a user is registered for a competition.
- **200** `{ success: true, data: { registered: false } }`
- **200** `{ success: true, data: { registered: true, registration: { id, competitionId, userId, registeredAt, status } } }`
- **400** — invalid ObjectId (competition or user)
- **404** — competition or user not found

### POST `/api/competitions/:id/register`
Register a user for a competition.
- **Body:** `{ "userId": "<ObjectId>" }`
- **201** `{ success: true, data: { registration: {...}, competition: { bookedSpots, remainingSpots } } }`
- **400** — missing/invalid userId or competitionId
- **404** — competition or user not found
- **409** — already registered / competition full / registration closed / deadline passed

---

## 9. Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster (or a local replica set)
- Expo CLI (`npm install -g expo-cli`) for mobile

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set your MONGO_URI
npm run seed        # creates demo competition + demo user; prints their IDs
npm run dev         # starts server at http://localhost:5000
```

**Environment variables (`backend/.env`):**
```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string_here
```

> `backend/.env` is gitignored and must never be committed.

### Mobile

```bash
cd mobile
npm install
npx expo start
```

**API configuration (`mobile/src/constants/config.js`):**
```js
export const API_BASE_URL = 'http://localhost:5000/api';
// Android Emulator: http://10.0.2.2:5000/api
// Physical device: use your computer's LAN IP, e.g. http://192.168.1.X:5000/api

export const DEMO_COMPETITION_ID = 'REPLACE_WITH_COMPETITION_OBJECT_ID';  // from seed output
export const DEMO_USER_ID        = 'REPLACE_WITH_USER_OBJECT_ID';         // from seed output
```

> `localhost` on a physical device refers to the phone itself. Replace with your computer's LAN IP (e.g. `192.168.1.42`) when testing on a real device.

---

## 10. Testing (Phase 6)

The `backend/test/` directory contains a Phase 6 test suite covering edge cases, concurrency, lifecycle enforcement, and capacity limits. See [`backend/test/README.md`](backend/test/README.md) for full instructions.

```bash
cd backend

# Edge cases — requires running backend + seeded IDs
COMPETITION_ID=<id> USER_ID=<id> npm run test:edge

# Concurrency last-seat race
npm run test:concurrency

# Lifecycle + deadline enforcement
npm run test:lifecycle

# Full competition rejection
npm run test:full
```

**Concurrency test scenario:** Creates a competition with `maxParticipants=20, bookedSpots=19`. Fires two simultaneous registration requests. Verifies exactly one succeeds (201) and one is rejected (409), and final `bookedSpots === 20` — never 21.

> These tests are provided and should be executed against a configured MongoDB environment before submission.

---

## 11. Demo User

This assignment uses a seeded demo user rather than a complete authentication system. This is an intentional assignment trade-off: implementing authentication (JWT, sessions, OAuth) is outside the assignment scope and would obscure the API design and concurrency implementation being evaluated.

The seed script (`npm run seed`) creates one demo competition and one demo user. Their ObjectIds are printed on completion and must be pasted into `mobile/src/constants/config.js`.

---

## 12. Assumptions & Honest Trade-offs

| Area | Implementation | Note |
|---|---|---|
| Authentication | Seeded demo user | Full auth outside assignment scope |
| Payment | Secure-payment UI per design spec | Real Razorpay flow not implemented |
| Upload submission | UI element; active only during `SUBMISSION_OPEN` | Production media pipeline outside scope |
| Testimonials | Static mock data | No backend testimonials endpoint |
| Demo data | Seeded via `seed/seed.js` | |

---

## 13. Production-Ready Decisions

- All credentials via environment variables — nothing hardcoded
- `backend/.env` gitignored — no secrets in repository
- Centralized error middleware with correct HTTP status codes
- ObjectId validation before any database query
- Atomic conditional capacity claim prevents over-booking
- MongoDB session/transaction ensures seat-claim and Registration creation are all-or-nothing
- Unique compound index `{ competitionId, userId }` at database level
- Server-side lifecycle + deadline validation — frontend countdown is display-only
- `remainingSpots` computed at read time, never stored
- Reusable, single-responsibility React Native components
- Dedicated API service layer (`api.js` + `competitionService.js`) in mobile
- Loading, error, and empty states handled throughout

---

## 14. Verification Notes

The backend source is syntax-checked and its dependencies install with `npm ci`.
The mobile dependency tree installs successfully with `npm install` and `npm ls`.
The database-backed seed, API integration tests, and on-device Expo run require a
MongoDB replica-set URI and a simulator or physical device, so they should be run
locally before recording the final demonstration. Do not mark those runtime checks
as passed until they are actually executed.

---

## 15. Future Improvements

- User authentication (JWT / OAuth)
- Real payment processing (Razorpay integration)
- Secure video/file upload (AWS S3 / Cloudinary)
- Push notifications (registration confirmation, result announcements)
- Admin dashboard (manage competitions, review submissions)
- Pagination for winners and competitions list
- Rate limiting on registration endpoint
- Production observability (structured logging, metrics)
- Automated CI/CD pipeline
- Stronger input validation (Joi / Zod)
- Refresh token rotation

---

## License

ISC

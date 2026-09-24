# Screen Recording Script
## Feedants Classical Dance — Full Stack Assignment Demonstration

---

### Preparation (before hitting record)

- Terminal A: backend running (`npm run dev` inside `backend/`)
- Terminal B: Expo running (`npx expo start` inside `mobile/`)
- Emulator or physical device connected and showing the app
- `API_BASE_URL` is correct for the selected device/emulator. The app resolves seeded IDs automatically.

---

## PART 1 — Backend Startup

**[Show Terminal A]**

> "I am starting the Node.js and Express backend. The server is configured using environment variables — the MongoDB Atlas connection string is stored in a `.env` file that is gitignored and never committed to the repository."

```bash
cd backend
npm run dev
```

> "The backend connects to MongoDB Atlas. Once the connection is established, the server is ready on port 5000."

*Wait for: `Server running on port 5000` and `MongoDB connected`*

---

## PART 2 — Mobile App Start

**[Switch to Expo terminal / show device]**

> "The React Native application is built with Expo. I am starting the development server now."

```bash
cd mobile
npx expo start
```

> "The mobile app is designed to communicate exclusively with the backend through REST APIs. It does not connect to MongoDB directly. No credentials of any kind are present in the mobile code."

*Wait for app to load on device/emulator*

---

## PART 3 — Competition Details Screen

**[Show the loaded competition screen on device]**

> "The competition details screen has loaded. All data shown here — the competition name, entry fee, prize pool, judge details, important dates, and remaining spots — is fetched from MongoDB through the backend API."

*Scroll slowly through the screen*

> "The app makes three API calls in parallel when the screen loads: one for competition details, one for the previous winners, and one for the registration status of the demo user. This avoids sequential waterfall loading."

---

## PART 4 — Countdown Timer

**[Point to countdown]**

> "The countdown timer counts down to the registration deadline. This is a client-side display only. The backend re-validates the deadline on every registration attempt — the timer is never the authority for eligibility."

---

## PART 5 — Important Dates, Judge, Winners, Rewards

**[Scroll through each section]**

> "Important dates, the judge profile, previous winners, and reward tiers are all dynamic — they come from the database, not from hardcoded values in the mobile app."

---

## PART 6 — Registration

**[Show the Register button]**

> "The demo user is not yet registered. I will tap the Register button now."

*Tap Register*

> "The mobile app sends a POST request to the backend. The backend validates the competition lifecycle — status must be REGISTRATION_OPEN — validates that the registration deadline has not passed, and then performs an atomic capacity check before incrementing the booked spots count."

*Wait for success response*

> "Registration succeeded. The backend returned 201 Created with the updated seat count. The mobile app immediately re-fetches the competition data to show the authoritative remaining spots from the database."

*Show updated remaining spots on screen*

---

## PART 7 — Duplicate Registration Rejection

**[Tap Register button again — it should now be in registered state, but demonstrate the protection]**

> "I will now attempt to register the same user a second time to demonstrate duplicate protection."

*If the button allows a second attempt, tap it again*

> "The backend returns 409 Conflict — the user is already registered. This rejection is enforced at two levels: first by an application-layer check inside the registration service, and second by a unique compound database index on the combination of competition ID and user ID. Even if two concurrent requests bypass the application check simultaneously, the database index guarantees that only one Registration document can be created."

---

## PART 8 — Concurrency Protection (explain, don't necessarily demo live)

**[Show the concurrency test script in the terminal, or explain verbally]**

> "For the concurrency safety demonstration: the Phase 6 test suite includes a dedicated last-seat race test. It sets up a competition with 19 out of 20 spots booked, then fires two registration requests simultaneously using Promise.all. The backend uses a single atomic findOneAndUpdate operation that combines the capacity check and the increment — MongoDB evaluates these as one atomic per-document operation, so at most one concurrent request can claim the final spot. The other receives a conflict response. The final booked spots count is always 20, never 21."

> "Additionally, the seat increment and the registration document creation run inside a MongoDB session transaction. If the registration document insert fails for any reason — for example a duplicate key error — the transaction rolls back the increment automatically, keeping the database consistent."

---

## PART 9 — Loading and Error States

**[Optional: demonstrate by briefly disabling the backend and retrying]**

> "The app handles loading and error states. While API calls are in progress, a loading indicator is shown. If the backend is unreachable, an error message is displayed with a Retry button that re-attempts all three API calls."

---

## PART 10 — Wrap Up

> "To summarize: the Feedants Classical Dance competition details application demonstrates a complete full-stack mobile implementation — a React Native Expo frontend consuming a Node.js Express backend backed by MongoDB Atlas, with atomic concurrency control, MongoDB transaction consistency, server-side lifecycle and deadline enforcement, and a Phase 6 test suite that validates all of these behaviors."

---

## Notes

- Keep the recording under 5 minutes
- Show real API responses in the terminal if possible (nodemon output)
- Do not fabricate any results or claim features not implemented
- The secure payment UI, Refer & Earn card, and Upload Submission button are UI elements per the design spec — a real Razorpay payment flow and production media upload pipeline are outside the current assignment scope and should be stated as such if asked

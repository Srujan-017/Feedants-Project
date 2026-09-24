# Final Submission Checklist
## Feedants Classical Dance — Full Stack Assignment

Complete every item before submitting. Mark each `[x]` when confirmed.

---

## PROJECT SETUP

- [ ] **Backend present** — `backend/src/`, `backend/seed/`, `backend/test/` all committed
- [ ] **Mobile present** — `mobile/src/`, `mobile/App.js`, `mobile/app.json` all committed
- [ ] **`backend/.env` NOT committed** — confirmed gitignored
- [ ] **`backend/.env.example` committed** — placeholder URI only, no real credentials
- [ ] **`node_modules/` NOT committed** — confirmed gitignored
- [ ] **`.expo/` NOT committed** — confirmed gitignored
- [ ] **MongoDB Atlas cluster accessible** — connection tested
- [ ] **Seed works** — `npm run seed` completes, prints competition and user IDs

---

## BACKEND STARTUP

- [ ] `cd backend && npm install` — completes without errors
- [ ] `npm run dev` — server starts at `http://localhost:5000`
- [ ] `GET http://localhost:5000/api/health` → 200
- [ ] `GET http://localhost:5000/api/health/db` → 200 (MongoDB connected)

---

## MOBILE STARTUP

- [ ] `cd mobile && npm install` — completes without errors
- [ ] `API_BASE_URL` configured for your device/emulator through `EXPO_PUBLIC_API_BASE_URL` when needed
- [ ] Seed data loaded — mobile resolves the current competition and Demo User IDs automatically
- [ ] `npx expo start` — Metro bundler starts
- [ ] App loads on emulator or physical device

---

## FUNCTIONALITY

- [ ] **Competition data dynamic** — data matches what is in MongoDB, not hardcoded
- [ ] **Winners dynamic** — winners section populated from database
- [ ] **Registration status dynamic** — correct registered/unregistered state on load
- [ ] **Registration works** — POST succeeds with 201, registration button updates
- [ ] **Spots update after registration** — remaining spots reflects new count from API
- [ ] **Countdown works** — timer ticks and shows correct time remaining
- [ ] **Lifecycle enforced** — backend rejects registration for non-REGISTRATION_OPEN statuses
- [ ] **Duplicate registration prevented** — second registration attempt returns 409
- [ ] **Full competition handled** — registration rejected when bookedSpots = maxParticipants
- [ ] **Expired deadline handled** — registration rejected when past registrationDeadline
- [ ] **Concurrency handled** — `npm run test:concurrency` shows exactly one 201, bookedSpots never exceeds maxParticipants
- [ ] **Invalid IDs handled** — 400 returned for malformed ObjectIds
- [ ] **Unknown resources handled** — 404 returned for valid-format but non-existent IDs

---

## LOADING / ERROR STATES

- [ ] **Loading state** — spinner appears while API calls are in progress
- [ ] **Error state** — error message shown when backend unreachable
- [ ] **Retry works** — Retry button re-fetches all three APIs
- [ ] **Empty winners state** — handled gracefully (no crash)

---

## PHASE 6 TESTS

- [ ] `npm run test:edge` — all edge case assertions pass
- [ ] `npm run test:concurrency` — last-seat race test passes (one 201, one conflict, bookedSpots = 20)
- [ ] `npm run test:lifecycle` — all lifecycle status + deadline tests pass
- [ ] `npm run test:full` — full competition rejection test passes

> If any test cannot run due to environment limitations, mark **NOT VERIFIED** and note the reason.

---

## CODE QUALITY

- [ ] **No secrets in source** — no real `MONGO_URI`, passwords, or API keys in committed files
- [ ] **Centralized error handling** — `errorMiddleware.js` handles all thrown errors
- [ ] **ObjectId validation** — `isValidObjectId` called before any DB query
- [ ] **Unique index exists** — `Registration.index({ competitionId: 1, userId: 1 }, { unique: true })`
- [ ] **Atomic capacity update** — `findOneAndUpdate` with `$expr` + `$inc` in registration service
- [ ] **Transaction consistency** — seat-claim + Registration insert inside `session.withTransaction()`
- [ ] **`remainingSpots` computed** — not stored in DB; calculated in `competitionService.js`

---

## DOCUMENTATION

- [ ] **Root README** — project overview, architecture, API reference, setup instructions
- [ ] **Backend README** — concise backend-specific setup and notes
- [ ] **Test README** — prerequisites, commands, expected outcomes, data safety
- [ ] **Screen recording script** — `docs/SCREEN_RECORDING_SCRIPT.md`
- [ ] **This checklist** — `docs/FINAL_SUBMISSION_CHECKLIST.md`

---

## GITHUB REPOSITORY

- [ ] **Repository URL** — `https://github.com/Srujan-017/Feedants-Project`
- [ ] **All committed files match expected structure** — `backend/`, `mobile/`, `docs/`, `README.md`
- [ ] **No `.env` file visible on GitHub**
- [ ] **No `node_modules/` visible on GitHub**
- [ ] **Search GitHub repo for `mongodb+srv://`** — must return 0 results
- [ ] **Search GitHub repo for `password`** — no real passwords in any file
- [ ] **MongoDB Atlas credential rotated** if any credential was ever visible in a commit

---

## SCREEN RECORDING

- [ ] Recording shows backend starting successfully
- [ ] Recording shows Expo starting and app loading
- [ ] Recording shows competition data loading from database
- [ ] Recording shows successful registration
- [ ] Recording shows remaining spots updating
- [ ] Recording shows duplicate registration being rejected (409)
- [ ] Concurrency protection is explained (verbally or via test script)
- [ ] Recording is under 5 minutes

---

## PRE-SUBMISSION FINAL CHECK

- [ ] `git status` — no unexpected files staged
- [ ] `git diff --stat` — review all changes
- [ ] MongoDB Atlas credential rotated if it was ever exposed
- [ ] Submission link / form filled on Internshala with GitHub repo URL

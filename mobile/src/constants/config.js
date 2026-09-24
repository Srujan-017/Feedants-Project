// ─── PHASE 5 CONFIGURATION ───────────────────────────────────────────────────
//
// For a physical Android/iOS device on the same Wi-Fi network, replace
// localhost with your computer's LAN IP (e.g. 192.168.1.42).
// Run `ipconfig` (Windows) or `ifconfig` / `ip route` (Mac/Linux) to find it.
//
// For Android Emulator use: http://10.0.2.2:5000/api
// For iOS Simulator, localhost works fine.
//
// DO NOT put MONGO_URI or any database credentials here.

export const API_BASE_URL = 'http://localhost:5000/api';

// ─── SEED IDs ─────────────────────────────────────────────────────────────────
// After running `npm run seed` in the backend folder, copy the printed IDs here.
//
// MANUAL ACTION REQUIRED:
//   cd backend
//   npm run seed
//
// The seed script prints:
//   Competition: "Feedants Classical Dance" (_id: <COMPETITION_ID>)
//   User: "Demo User" <demo@example.com> (_id: <USER_ID>)
//
// Paste those IDs below, then restart Expo.

export const DEMO_COMPETITION_ID = 'REPLACE_WITH_COMPETITION_OBJECT_ID';
export const DEMO_USER_ID = 'REPLACE_WITH_USER_OBJECT_ID';

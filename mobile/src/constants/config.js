// Set EXPO_PUBLIC_API_BASE_URL for a physical device, for example:
// http://192.168.1.42:5000/api. Never put database credentials here.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

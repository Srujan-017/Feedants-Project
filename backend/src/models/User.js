const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Intentionally minimal — no authentication in this phase (or the
 * assignment as a whole, per the documented assumption). This exists
 * only so Registration has a real userId to reference instead of a
 * frontend-only fake identity.
 */
const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);

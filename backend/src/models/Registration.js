const mongoose = require('mongoose');
const { Schema } = mongoose;

const REGISTRATION_STATUS = ['REGISTERED', 'CANCELLED'];

/**
 * A separate collection (not embedded in Competition) because:
 * 1. It needs to be queried independently of a competition load
 *    (e.g. "has this user registered?").
 * 2. Phase 3's atomic, concurrency-safe registration logic operates on
 *    Competition.bookedSpots + a Registration document together, which
 *    is far cleaner with Registration as its own collection than as a
 *    growing embedded array inside Competition.
 */
const RegistrationSchema = new Schema(
  {
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: 'Competition',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    registeredAt: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: REGISTRATION_STATUS,
      required: true,
      default: 'REGISTERED',
    },
  },
  { timestamps: true }
);

// CRITICAL: enforced at the database level, not just in application code,
// so a user can never end up with two registrations for the same
// competition even under concurrent requests.
RegistrationSchema.index({ competitionId: 1, userId: 1 }, { unique: true });

// Supports "list all registrations for competition X" (e.g. an admin/
// capacity view) without a full collection scan.
RegistrationSchema.index({ competitionId: 1 });

// Supports "list all competitions this user registered for".
RegistrationSchema.index({ userId: 1 });

module.exports = mongoose.model('Registration', RegistrationSchema);
module.exports.REGISTRATION_STATUS = REGISTRATION_STATUS;

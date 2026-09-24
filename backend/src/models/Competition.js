const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Canonical competition lifecycle. Keep this as the single source of
 * truth for status strings — never introduce alternate spellings
 * ("OPEN", "open", "Registration Open") anywhere else in the app.
 */
const COMPETITION_STATUS = [
  'UPCOMING',
  'REGISTRATION_OPEN',
  'REGISTRATION_CLOSED',
  'SUBMISSION_OPEN',
  'SUBMISSION_CLOSED',
  'RESULTS_PUBLISHED',
];

/**
 * Judge is 1:1 with a competition and is always read together with it
 * (never queried independently) — embedded, not a separate collection.
 */
const JudgeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    profession: { type: String, required: true, trim: true },
    experience: { type: String, required: true, trim: true },
    imageUrl: { type: String, trim: true },
    introVideoUrl: { type: String, trim: true },
  },
  { _id: false }
);

/**
 * Previous winners are always displayed as part of a competition's page
 * and never queried across competitions in this assignment's scope, so
 * they're embedded rather than a separate "Winner" collection.
 */
const WinnerSchema = new Schema({
  name: { type: String, required: true, trim: true },
  position: { type: Number, required: true, min: 1 },
  imageUrl: { type: String, trim: true },
  videoUrl: { type: String, trim: true },
});

/**
 * Reward tiers ("1st Winner - ₹550", etc). Embedded for the same reason
 * as winners: always read with the competition, never independently.
 */
const RewardSchema = new Schema(
  {
    position: { type: Number, required: true, min: 1 },
    label: { type: String, required: true, trim: true }, // e.g. "1st Winner"
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const CompetitionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },

    // URL-friendly unique identifier, e.g. "feedants-classical-dance".
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    category: { type: String, required: true, trim: true }, // e.g. "Dance"
    type: { type: String, required: true, trim: true }, // e.g. "Multi-Win"

    status: {
      type: String,
      enum: COMPETITION_STATUS,
      required: true,
      default: 'UPCOMING',
    },

    prizePool: { type: Number, required: true, min: 0 },
    entryFee: { type: Number, required: true, min: 0 },

    maxParticipants: { type: Number, required: true, min: 1 },

    // Derived "remainingSpots" is intentionally NOT stored — it is always
    // computed as (maxParticipants - bookedSpots) at read time, so it can
    // never drift out of sync with the source values.
    bookedSpots: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      validate: {
        validator: function (value) {
          // `this` refers to the document being validated (works for
          // both `.save()` and Mongoose's `validate()` on a plain doc).
          const max = this.maxParticipants ?? this._update?.$set?.maxParticipants;
          return max === undefined || value <= max;
        },
        message: 'bookedSpots cannot exceed maxParticipants',
      },
    },

    registrationDeadline: { type: Date, required: true },
    submissionStart: { type: Date, required: true },
    submissionEnd: { type: Date, required: true },
    resultDate: { type: Date, required: true },

    judge: { type: JudgeSchema, required: true },

    previousWinners: { type: [WinnerSchema], default: [] },

    rewards: { type: [RewardSchema], default: [] },

    // Text/list content for the "About / Judging Parameters / Rules &
    // Eligibility" tabs. Arrays because the UI renders bullet lists, not
    // one large HTML/string blob.
    content: {
      aboutCompetition: { type: [String], default: [] },
      judgingParameters: { type: [String], default: [] },
      rules: { type: [String], default: [] },
      eligibility: { type: [String], default: [] },
      disclaimer: { type: String, trim: true, default: '' },
      refundPolicy: { type: String, trim: true, default: '' },
    },
  },
  { timestamps: true }
);

// Useful for filtering/listing competitions by lifecycle state.
CompetitionSchema.index({ status: 1 });

// Phase 3's deadline/expiry checks will query/sort on this.
CompetitionSchema.index({ registrationDeadline: 1 });

module.exports = mongoose.model('Competition', CompetitionSchema);
module.exports.COMPETITION_STATUS = COMPETITION_STATUS;

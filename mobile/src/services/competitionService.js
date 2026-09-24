import { api } from './api';

// ─── Shape mapper ─────────────────────────────────────────────────────────────
// The backend returns flat top-level date fields and flat content fields.
// Components were built against the mock's nested `dates` and `content` objects.
// This mapper bridges the gap so the UI needs no changes.
function toCompetition(data) {
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    category: data.category,
    type: data.type,
    status: data.status,
    prizePool: data.prizePool,
    entryFee: data.entryFee,
    maxParticipants: data.maxParticipants,
    bookedSpots: data.bookedSpots,
    remainingSpots: data.remainingSpots,
    registrationDeadline: data.registrationDeadline,

    judge: data.judge
      ? {
          name: data.judge.name,
          profession: data.judge.profession,
          experience: data.judge.experience,
          imageUrl: data.judge.imageUrl || null,
          introVideoUrl: data.judge.introVideoUrl || null,
        }
      : null,

    // Nested dates object expected by ImportantDates component
    dates: {
      registrationDeadline: data.registrationDeadline,
      submissionStart: data.submissionStart,
      submissionEnd: data.submissionEnd,
      resultDate: data.resultDate,
    },

    previousWinners: (data.previousWinners || []).map((w) => ({
      id: String(w.id || w._id),
      name: w.name,
      position: w.position,
      imageUrl: w.imageUrl || null,
    })),

    rewards: (data.rewards || []).map((r) => ({
      position: r.position,
      label: r.label,
      amount: r.amount,
    })),

    // Nested content object expected by CompetitionTabs and DisclaimerSection
    content: {
      aboutCompetition: data.aboutCompetition || [],
      judgingParameters: data.judgingParameters || [],
      rules: data.rules || [],
      eligibility: data.eligibility || [],
      disclaimer: data.disclaimer || '',
      refundPolicy: data.refundPolicy || '',
    },
  };
}

// ─── API functions ─────────────────────────────────────────────────────────────

export async function getCompetition(competitionId) {
  const data = await api.get(`/competitions/${competitionId}`);
  return toCompetition(data);
}

export async function getCompetitionWinners(competitionId) {
  const data = await api.get(`/competitions/${competitionId}/winners`);
  return (data || []).map((w) => ({
    id: String(w.id || w._id),
    name: w.name,
    position: w.position,
    imageUrl: w.imageUrl || null,
  }));
}

export async function getRegistrationStatus(competitionId, userId) {
  // Returns { registered: bool, registration?: {...} }
  return api.get(`/competitions/${competitionId}/registration-status/${userId}`);
}

export async function registerForCompetition(competitionId, userId) {
  return api.post(`/competitions/${competitionId}/register`, { userId });
}

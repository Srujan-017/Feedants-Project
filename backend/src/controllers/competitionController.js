const asyncHandler = require('../utils/asyncHandler');
const competitionService = require('../services/competitionService');

/**
 * GET /api/competitions/:id
 */
const getCompetition = asyncHandler(async (req, res) => {
  const data = await competitionService.getCompetitionById(req.params.id);
  res.status(200).json({ success: true, data });
});

/**
 * GET /api/competitions/:id/winners
 */
const getWinners = asyncHandler(async (req, res) => {
  const data = await competitionService.getWinnersByCompetitionId(req.params.id);
  res.status(200).json({ success: true, data });
});

/**
 * GET /api/competitions/demo-context
 * Returns the current seeded competition and unregistered Demo User IDs.
 */
const getDemoContext = asyncHandler(async (req, res) => {
  const data = await competitionService.getDemoContext();
  res.status(200).json({ success: true, data });
});

module.exports = { getCompetition, getWinners, getDemoContext };

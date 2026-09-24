const asyncHandler = require('../utils/asyncHandler');
const registrationService = require('../services/registrationService');

/**
 * GET /api/competitions/:id/registration-status/:userId
 */
const getRegistrationStatus = asyncHandler(async (req, res) => {
  const { id: competitionId, userId } = req.params;
  const data = await registrationService.getRegistrationStatus(competitionId, userId);
  res.status(200).json({ success: true, data });
});

/**
 * POST /api/competitions/:id/register
 * Body: { "userId": "<demo user ObjectId>" }
 */
const registerUser = asyncHandler(async (req, res) => {
  const competitionId = req.params.id;
  const { userId } = req.body || {};

  const data = await registrationService.registerUserForCompetition(competitionId, userId);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data,
  });
});

module.exports = { getRegistrationStatus, registerUser };

const express = require('express');
const competitionController = require('../controllers/competitionController');
const registrationRoutes = require('./registrationRoutes');

const router = express.Router();

// Keep named routes before /:id so Express does not treat "demo-context" as
// a MongoDB ObjectId.
router.get('/demo-context', competitionController.getDemoContext);
router.get('/:id', competitionController.getCompetition);
router.get('/:id/winners', competitionController.getWinners);

// Nests /registration-status/:userId and /register under /:id without
// re-declaring the /api/competitions prefix (avoids /api/api/... bugs).
router.use('/:id', registrationRoutes);

module.exports = router;

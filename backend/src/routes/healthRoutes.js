const express = require('express');
const { getDbStatus } = require('../config/db');

const router = express.Router();

/**
 * GET /api/health
 * Simple liveness check for the API process itself (does not touch MongoDB).
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Feedants API is running',
  });
});

/**
 * GET /api/health/db
 * Checks the *actual* current Mongoose connection state rather than
 * blindly returning success.
 */
router.get('/db', (req, res) => {
  const dbStatus = getDbStatus();

  if (!dbStatus.healthy) {
    return res.status(503).json({
      success: false,
      message: 'Database connection is not healthy',
      state: dbStatus.state,
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Database connection is healthy',
    state: dbStatus.state,
  });
});

module.exports = router;

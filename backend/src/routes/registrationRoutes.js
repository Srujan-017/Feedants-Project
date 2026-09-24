const express = require('express');
const registrationController = require('../controllers/registrationController');

// mergeParams: true so this router can read :id from the parent
// competitionRoutes router it's mounted under.
const router = express.Router({ mergeParams: true });

router.get('/registration-status/:userId', registrationController.getRegistrationStatus);
router.post('/register', registrationController.registerUser);

module.exports = router;

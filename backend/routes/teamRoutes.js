const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authenticate = require('../middlewares/authMiddleware');

// POST /api/teams - Create a main team
router.post('/', authenticate, teamController.create); // Create a main team with the channel_id automatically fetched based on the admin role

// POST /api/teams/:parentTeamId/subteam - Create a sub-team inside a parent team
router.post('/:parentTeamId/subteam', authenticate, teamController.createSubteam); // Create a sub-team under a parent team

// GET /api/teams/channel/:channelId - Get all teams for a specific channel
router.get('/channel/:channelId', authenticate, teamController.getTeamsForChannel);

module.exports = router;

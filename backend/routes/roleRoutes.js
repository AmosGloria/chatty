const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authenticate = require('../middlewares/authMiddleware');

// POST /api/roles/:channelId/create-role
router.post('/:channelId/create-role', authenticate, roleController.createRole);

// POST /api/roles/:channelId/assign-role/:userId
router.post('/:channelId/assign-role/:userId', authenticate, roleController.assignRole);

// PUT /api/roles/:channelId/update-role/:roleId
router.put('/:channelId/update-role/:roleId', authenticate, roleController.updateRolePermissions);

// GET /api/roles/:channelId/roles
router.get('/:channelId/roles', authenticate, roleController.getRolesInChannel);

module.exports = router;

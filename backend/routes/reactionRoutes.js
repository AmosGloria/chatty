const express = require('express');
const router = express.Router();
const { toggle, getByMessage } = require('../controllers/reactionController');

router.post('/', toggle);              // Toggle emoji (add or remove)
router.get('/:id', getByMessage);      // Get all reactions for a message

module.exports = router;

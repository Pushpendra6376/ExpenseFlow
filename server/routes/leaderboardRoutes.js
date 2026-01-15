const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/leaderboardController');
const authenticate = require('../middleware/AuthMiddleware');

// Leaderboard dekhne ke liye login zaroori hai
router.get('/', authenticate, getLeaderboard);

module.exports = router;
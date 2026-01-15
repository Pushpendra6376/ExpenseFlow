const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboardController');
const authenticate = require('../middleware/AuthMiddleware');

router.get('/stats', authenticate, getDashboardData);

module.exports = router;
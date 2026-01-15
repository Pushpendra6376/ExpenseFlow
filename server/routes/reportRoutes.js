const express = require('express');
const router = express.Router();
const { downloadReport, getReportLogs } = require('../controllers/reportController');
const authenticate = require('../middleware/AuthMiddleware');

// Report download karne par log banega
router.post('/download', authenticate, downloadReport);

// User apne purane downloads dekh sakega
router.get('/history', authenticate, getReportLogs);

module.exports = router;
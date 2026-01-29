const express = require('express');
const router = express.Router();
const { downloadReport, getReportLogs, getReportPreview } = require('../controllers/reportController');
const authenticate = require('../middleware/AuthMiddleware');

router.post('/download', authenticate, downloadReport);
router.get('/history', authenticate, getReportLogs);

// ✅ NEW ROUTE: Table Data dikhane ke liye
router.post('/preview', authenticate, getReportPreview);

module.exports = router;
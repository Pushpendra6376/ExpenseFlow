const express = require('express');
const router = express.Router();
const { downloadReport, getReportLogs } = require('../controllers/reportController');
const authenticate = require('../middleware/AuthMiddleware');


router.post('/download', authenticate, downloadReport);


router.get('/history', authenticate, getReportLogs);

module.exports = router;
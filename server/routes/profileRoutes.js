const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword } = require('../controllers/profileController');
const authenticate = require('../middleware/AuthMiddleware');

router.get('/', authenticate, getProfile);
router.put('/update', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

module.exports = router;
const express = require('express');
const router = express.Router();
const { signUp, login, forgotPassword, resetPassword } = require('../controllers/AuthController');

router.post('/signup', signUp);
router.post('/login', login);


router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
module.exports = router;
const bcrypt = require('bcryptjs'); 
const jwt = require("jsonwebtoken");
const User = require('../models/User'); 
const crypto = require('crypto'); 
const { Op } = require('sequelize');
const { sendResetEmail } = require('../services/brevoEmail');
require("dotenv").config();

// ====== SIGNUP =====
exports.signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            totalIncome: 0,   
            totalExpense: 0, 
            savingsRate: 0    
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                isPremium: newUser.isPremium
            }
        });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: "Something went wrong during signup" });
    }
};

//======== LOGIN ======
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare password
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        // Create JWT token
        const token = jwt.sign({
            userId: user.id,
            email: user.email
        }, process.env.JWT_SECRET, { expiresIn: "7d" }); 

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isPremium: user.isPremium,
                totalIncome: user.totalIncome,
                totalExpense: user.totalExpense
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Something went wrong during login" });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Token Generate
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Database me save
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 3600000; // 10 minutes
        await user.save();

        const emailSent = await sendResetEmail(user.email, resetToken);

        if (emailSent) {
            res.status(200).json({ success: true, message: "Reset link sent to your email" });
        } else {
            user.resetPasswordToken = null;
            user.resetPasswordExpire = null;
            await user.save();
            res.status(500).json({ success: false, message: "Email sending failed" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// 2. RESET PASSWORD 
exports.resetPassword = async (req, res) => {
    try {
        // URL se token milega
        const resetToken = req.params.token;

        const user = await User.findOne({
            where: {
                resetPasswordToken: resetToken,
                resetPasswordExpire: { [Op.gt]: Date.now() } // Expiry > Abhi ka time
            }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or Expired Token" });
        }

        const bcrypt = require('bcryptjs'); 
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);

        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;
        
        await user.save();

        res.status(200).json({ success: true, message: "Password Updated! Please Login." });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

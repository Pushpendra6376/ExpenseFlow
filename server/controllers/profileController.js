const User = require('../models/User');
const bcrypt = require('bcryptjs');

// 1. GET PROFILE
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId, {
            attributes: ['name', 'email', 'isPremium', 'totalIncome', 'totalExpense', 'createdAt'] 
        });

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// 2. UPDATE PROFILE 
exports.updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        const user = await User.findByPk(req.user.userId);

        if(name) user.name = name;
        await user.save();

        res.status(200).json({ success: true, message: "Profile Updated Successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Update Failed" });
    }
};

// 3. CHANGE PASSWORD
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.userId);

        // Check Old Password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect Old Password" });
        }

        // Hash New Password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ success: true, message: "Password Changed Successfully!" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
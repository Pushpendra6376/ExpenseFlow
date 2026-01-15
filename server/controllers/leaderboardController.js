const User = require('../models/User');
const { Op } = require('sequelize');

exports.getLeaderboard = async (req, res) => {
    try {
        // 1. Top 10 Users nikalo jinka Total Expense sabse zyada hai
        const leaderboard = await User.findAll({
            // Order by Expense (Sabse zyada kharcha karne wala upar)
            order: [['totalExpense', 'DESC']], 
            
            // Sirf Top 10 log
            limit: 10,
            
            // Hum sirf ye fields bhejenge (Profile Pic hata diya)
            attributes: ['id', 'name', 'totalExpense', 'isPremium']
        });

        // 2. Meri Rank nikalo
        // Logic: Mere se zyada kharcha karne wale kitne log hain? + 1
        const myRank = await User.count({
            where: {
                totalExpense: {
                    [Op.gt]: req.user.totalExpense // Count users with expense > mine
                }
            }
        }) + 1;

        res.status(200).json({
            success: true,
            leaderboard,
            myRank,
            myScore: req.user.totalExpense // Score ab Expense hai
        });

    } catch (error) {
        console.error("Leaderboard Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
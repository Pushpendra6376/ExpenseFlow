const User = require('../models/User');
const { Op } = require('sequelize');

exports.getLeaderboard = async (req, res) => {
    try {
        
        const leaderboard = await User.findAll({
    
            order: [['totalExpense', 'DESC']],
            
            limit: 10,
            attributes: ['id', 'name', 'totalExpense', 'isPremium']
        });

        const myRank = await User.count({
            where: {
                totalExpense: {
                    [Op.gt]: req.user.totalExpense
                }
            }
        }) + 1;

        res.status(200).json({
            success: true,
            leaderboard,
            myRank,
            myScore: req.user.totalExpense
        });

    } catch (error) {
        console.error("Leaderboard Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
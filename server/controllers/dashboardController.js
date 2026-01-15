const { Op, Sequelize } = require('sequelize');
const Transaction = require('../models/Transaction'); 
const sequelize = require('../config/db'); 

exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.userId;

        // --- 1. Total Income Calculate karo (Direct Transaction Table se) ---
        const totalIncomeObj = await Transaction.findOne({
            where: { userId, type: 'income' },
            attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
            raw: true
        });
        const totalIncome = totalIncomeObj.total ? Number(totalIncomeObj.total) : 0;

        // --- 2. Total Expense Calculate karo ---
        const totalExpenseObj = await Transaction.findOne({
            where: { userId, type: 'expense' },
            attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
            raw: true
        });
        const totalExpense = totalExpenseObj.total ? Number(totalExpenseObj.total) : 0;

        // --- 3. Balance nikaalo ---
        const totalBalance = totalIncome - totalExpense;

        // --- 4. Recent Transactions (Last 30 days) ---
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        const history = await Transaction.findAll({
            where: {
                userId,
                date: { [Op.gte]: last30Days }
            },
            // ✅ Fix: 'title' hata kar 'description' kar diya
            attributes: ['id', 'description', 'category', 'date', 'type', 'amount'], 
            order: [['date', 'DESC']], 
            limit: 10,
            raw: true
        });

        // --- 5. Response Bhejo ---
        res.json({
            success: true,
            userTotals: {                
                totalIncome: totalIncome,
                totalExpense: totalExpense,
                balance: totalBalance
            },
            recentTransactions: history
        });

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
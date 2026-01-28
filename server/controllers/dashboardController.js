const { Op, Sequelize } = require('sequelize');
const Transaction = require('../models/Transaction'); 
const sequelize = require('../config/db'); 

exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.userId;

        //Total Income Calculate 
        const totalIncomeObj = await Transaction.findOne({
            where: { userId, type: 'income' },
            attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
            raw: true
        });
        const totalIncome = totalIncomeObj.total ? Number(totalIncomeObj.total) : 0;

        //Total Expense Calculate
        const totalExpenseObj = await Transaction.findOne({
            where: { userId, type: 'expense' },
            attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
            raw: true
        });
        const totalExpense = totalExpenseObj.total ? Number(totalExpenseObj.total) : 0;

        //Balance 
        const totalBalance = totalIncome - totalExpense;

        //Recent Transaction
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        const history = await Transaction.findAll({
            where: {
                userId,
                date: { [Op.gte]: last30Days }
            },
            attributes: ['id', 'description', 'category', 'date', 'type', 'amount'], 
            order: [['date', 'DESC']], 
            limit: 10,
            raw: true
        });

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
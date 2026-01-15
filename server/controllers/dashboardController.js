const { Op, Sequelize } = require('sequelize');
const Transaction = require('../models/Transaction');
const sequelize = require('../config/db');

exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.userId;

        const categoryStats = await Transaction.findAll({
            where: { 
                userId, 
                type: 'expense' 
            },
            attributes: [
                'category',
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
            ],
            group: ['category'],
            raw: true
        });

        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        const history = await Transaction.findAll({
            where: {
                userId,
                date: {
                    [Op.gte]: last30Days 
                }
            },
            attributes: ['date', 'type', 'amount'],
            order: [['date', 'ASC']],
            raw: true
        });

        let chartData = [];
        let dateMap = {};

        history.forEach(t => {
            const dateStr = t.date; 
            if (!dateMap[dateStr]) {
                dateMap[dateStr] = { date: dateStr, income: 0, expense: 0 };
                chartData.push(dateMap[dateStr]);
            }
            if (t.type === 'income') dateMap[dateStr].income += Number(t.amount);
            if (t.type === 'expense') dateMap[dateStr].expense += Number(t.amount);
        });

        res.json({
            success: true,
            pieChartData: categoryStats, 
            lineChartData: chartData,    
            userTotals: {                
                totalIncome: req.user.totalIncome,
                totalExpense: req.user.totalExpense,
                balance: Number(req.user.totalIncome) - Number(req.user.totalExpense)
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
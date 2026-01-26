const { sequelize } = require('../models'); 
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { predictCategory } = require('../services/geminiService'); 
const { Op } = require('sequelize'); 
// ==== ADD TRANSACTION ====
exports.addTransaction = async (req, res) => {
    const t = await sequelize.transaction(); // Transaction start (Safety ke liye)

    try {
        let { amount, type, category, description, date } = req.body;
        const userId = req.user.userId;

        // Validation
        if (!amount || !type || !category) {
            await t.rollback();
            return res.status(400).json({ success: false, error: 'Please provide all fields' });
        }

        // 1. Transaction Create karo
        const transaction = await Transaction.create({
            amount,
            type,
            category,
            description,
            date: date || new Date(),
            userId
        }, { transaction: t });

        // 2. User Table Update karo (Jadoo yahan hai) 🪄
        const user = await User.findByPk(userId);
        
        if (user) {
            if (type === 'income') {
                // Agar income hai to totalIncome badhao
                await user.increment('totalIncome', { by: amount, transaction: t });
            } else if (type === 'expense') {
                // Agar expense hai to totalExpense badhao
                await user.increment('totalExpense', { by: amount, transaction: t });
            }
        }

        await t.commit(); // Sab save karo

        res.status(201).json({
            success: true,
            data: transaction,
            message: 'Transaction Added & Totals Updated!'
        });

    } catch (error) {
        await t.rollback(); // Error aaya to sab undo karo
        console.error("Add Transaction Error:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// === GET ALL TRANSACTIONS ===
exports.getAllTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10, type, duration, startDate, endDate, search } = req.query;
        const userId = req.user.userId;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const whereClause = { userId };

        // 1. Filter by Type
        if (type && type !== 'all') {
            whereClause.type = type;
        }

        // 2. Search Filter (Description or Category)
        if (search) {
            whereClause[Op.or] = [
                { description: { [Op.like]: `%${search}%` } },
                { category: { [Op.like]: `%${search}%` } }
            ];
        }

        // 3. Date Filter Logic
        if (duration) {
            const today = new Date();
            let start, end;

            if (duration === 'today') {
                start = new Date();
                end = new Date();
            } else if (duration === 'yesterday') {
                start = new Date(); 
                start.setDate(today.getDate() - 1);
                end = new Date(start);
            } else if (duration === 'this_month') {
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            } else if (duration === 'custom' && startDate && endDate) {
                start = new Date(startDate);
                end = new Date(endDate);
            }

            if (start && end) {
                whereClause.date = {
                    [Op.between]: [start, end]
                };
            }
        }

        // Use findAndCountAll for Pagination Data
        const { count, rows } = await Transaction.findAndCountAll({
            where: whereClause,
            order: [['date', 'DESC']], // Latest first
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            success: true,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: rows
        });

    } catch (error) {
        console.error("Filter Error:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

//=== DELETE TRANSACTION ===
exports.deleteTransaction = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const transactionId = req.params.id;
        const userId = req.user.userId;

        // Transaction dhundo
        const transaction = await Transaction.findOne({
            where: { id: transactionId, userId: userId }
        });

        if (!transaction) {
            await t.rollback();
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }

        const { amount, type } = transaction;

        // 1. Transaction Delete karo
        await transaction.destroy({ transaction: t });

        // 2. User Table se paisa kam karo (Jadoo part 2) 🪄
        const user = await User.findByPk(userId);

        if (user) {
            if (type === 'income') {
                // Income delete hui, to totalIncome kam karo
                await user.decrement('totalIncome', { by: amount, transaction: t });
            } else if (type === 'expense') {
                // Expense delete hua, to totalExpense kam karo
                await user.decrement('totalExpense', { by: amount, transaction: t });
            }
        }

        await t.commit();

        res.status(200).json({
            success: true,
            data: {},
            message: 'Transaction Deleted & Totals Updated!'
        });

    } catch (error) {
        await t.rollback();
        console.error("Delete Transaction Error:", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// ==== UPDATE TRANSACTION (EDIT) ====
exports.updateTransaction = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { amount, category, description, date, type } = req.body;
        const userId = req.user.userId;

        // Purana transaction dhundo
        const transaction = await Transaction.findOne({ where: { id, userId } });
        if (!transaction) {
            await t.rollback();
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }

        const user = await User.findByPk(userId);

        // Logic: Pehle purana amount minus karo, fir naya add karo
        let newIncome = Number(user.totalIncome);
        let newExpense = Number(user.totalExpense);

        // 1. Revert Old Amount
        if (transaction.type === 'income') newIncome -= Number(transaction.amount);
        else newExpense -= Number(transaction.amount);

        // 2. Add New Amount
        if (type === 'income') newIncome += Number(amount);
        else newExpense += Number(amount);

        // User Update
        await user.update({ 
            totalIncome: newIncome, 
            totalExpense: newExpense 
        }, { transaction: t });

        // Transaction Update
        await transaction.update({
            amount, category, description, date, type
        }, { transaction: t });

        await t.commit();
        res.status(200).json({ success: true, message: 'Transaction Updated' });

    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { predictCategory } = require('../services/geminiService');

exports.addTransaction = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        let { amount, type, category, description, date } = req.body;
        const userId = req.user.userId;

        if (!amount || !type) {
            await t.rollback();
            return res.status(400).json({ success: false, error: 'Amount & type required' });
        }

        // 🤖 AI Category
        if (type === 'expense' && (!category || category === 'Uncategorized')) {
            category = await predictCategory(description);
        }

        if (!category) category = 'Other';

        // 1️⃣ Create transaction
        const transaction = await Transaction.create({
            amount,
            type,
            category,
            description,
            date: date || new Date(),
            userId
        }, { transaction: t });

        // 2️⃣ Update user totals (SAFE)
        if (type === 'income') {
            await User.increment('totalIncome', {
                by: amount,
                where: { id: userId },
                transaction: t
            });
        } else {
            await User.increment('totalExpense', {
                by: amount,
                where: { id: userId },
                transaction: t
            });
        }

        await t.commit();

        res.status(201).json({
            success: true,
            data: transaction,
            message: 'Transaction added successfully'
        });

    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};


exports.getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10, type, search, startDate, endDate } = req.query;
        const userId = req.user.userId;

        const where = { userId };
        const offset = (page - 1) * limit;

        if (type && type !== 'all') where.type = type;

        if (search) {
            where[Op.or] = [
                { description: { [Op.like]: `%${search}%` } },
                { category: { [Op.like]: `%${search}%` } }
            ];
        }

        if (startDate && endDate) {
            where.date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        }

        const { count, rows } = await Transaction.findAndCountAll({
            where,
            order: [['date', 'DESC']],
            limit: Number(limit),
            offset: Number(offset)
        });

        res.status(200).json({
            success: true,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            data: rows
        });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};


exports.deleteTransaction = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const transaction = await Transaction.findOne({ where: { id, userId } });
        if (!transaction) {
            await t.rollback();
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }

        const { amount, type } = transaction;

        await transaction.destroy({ transaction: t });

        if (type === 'income') {
            await User.decrement('totalIncome', {
                by: amount,
                where: { id: userId },
                transaction: t
            });
        } else {
            await User.decrement('totalExpense', {
                by: amount,
                where: { id: userId },
                transaction: t
            });
        }

        await t.commit();
        res.status(200).json({ success: true, message: 'Transaction deleted' });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};


exports.updateTransaction = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { amount, category, description, date, type } = req.body;
        const userId = req.user.userId;

        const transaction = await Transaction.findOne({ where: { id, userId } });
        if (!transaction) {
            await t.rollback();
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }

        // 1️⃣ revert old
        if (transaction.type === 'income') {
            await User.decrement('totalIncome', {
                by: transaction.amount,
                where: { id: userId },
                transaction: t
            });
        } else {
            await User.decrement('totalExpense', {
                by: transaction.amount,
                where: { id: userId },
                transaction: t
            });
        }

        // 2️⃣ add new
        if (type === 'income') {
            await User.increment('totalIncome', {
                by: amount,
                where: { id: userId },
                transaction: t
            });
        } else {
            await User.increment('totalExpense', {
                by: amount,
                where: { id: userId },
                transaction: t
            });
        }

        // 3️⃣ update transaction
        await transaction.update({
            amount,
            category,
            description,
            date,
            type
        }, { transaction: t });

        await t.commit();
        res.status(200).json({ success: true, message: 'Transaction updated' });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

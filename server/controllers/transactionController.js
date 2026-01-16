const { sequelize } = require('../models'); 
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { predictCategory } = require('../services/geminiService'); 

// ==== ADD TRANSACTION ====
exports.addTransaction = async (req, res) => {
    try {
        let { amount, type, category, description, date } = req.body;
        const userId = req.user.userId;

        if (type === 'expense' && (!category || category === 'Uncategorized')) {
            console.log("🤖 AI Categorizing for:", description);
            
            category = await predictCategory(description);
            
            console.log("✅ AI Selected:", category);
        }

        if (!category) {
            category = 'Other';
        }

        const transaction = await Transaction.create({
            amount,
            type, // 'income' or 'expense'
            category,
            description,
            date: date || new Date(),
            userId
        });

        res.status(201).json({
            success: true,
            data: transaction,
            message: `Transaction added as ${category}`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// === GET ALL TRANSACTIONS ===
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            where: { userId: req.user.userId },
            order: [['date', 'DESC']] 
        });

        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

//=== DELETE TRANSACTION ===
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

        const user = await User.findByPk(userId);
        
        let newIncome = Number(user.totalIncome);
        let newExpense = Number(user.totalExpense);

        if (transaction.type === 'income') {
            newIncome -= Number(transaction.amount);
        } else {
            newExpense -= Number(transaction.amount);
        }

        let newSavingsRate = 0;
        if (newIncome > 0) {
            newSavingsRate = ((newIncome - newExpense) / newIncome) * 100;
        }

        await user.update({
            totalIncome: newIncome,
            totalExpense: newExpense,
            savingsRate: newSavingsRate
        }, { transaction: t });

    
        await transaction.destroy({ transaction: t });

        await t.commit();

        res.status(200).json({ success: true, message: 'Transaction deleted & Stats updated' });

    } catch (error) {
        await t.rollback();
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
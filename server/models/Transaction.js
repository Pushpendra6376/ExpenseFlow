const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    type: {
        type: DataTypes.ENUM('income', 'expense'), 
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false
    },
    category: {
        type: DataTypes.STRING, 
        allowNull: false
    },
    description: {
        type: DataTypes.STRING, 
        allowNull: true
    },
    date: {
        type: DataTypes.DATEONLY, 
        defaultValue: DataTypes.NOW
    }
});

module.exports = Transaction;
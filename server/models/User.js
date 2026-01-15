const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 
const { v4: uuidv4 } = require('uuid'); 

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(), 
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    
    isPremium: {
        type: DataTypes.BOOLEAN,
        defaultValue: false 
    },
    
    totalIncome: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    totalExpense: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetPasswordExpire: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

module.exports = User;
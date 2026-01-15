const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const ForgotPassword = sequelize.define('ForgotPassword', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true 
    },
    expiresAt: {
        type: DataTypes.DATE, 
        allowNull: false
    }
});

module.exports = ForgotPassword;
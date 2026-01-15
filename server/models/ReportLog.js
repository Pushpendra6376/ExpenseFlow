const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ReportLog = sequelize.define('ReportLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    reportType: {
        type: DataTypes.STRING, 
        allowNull: false
    },
    period: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'SUCCESS'
    }
});

module.exports = ReportLog;
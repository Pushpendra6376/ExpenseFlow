const sequelize = require('../config/db');

// importing models
const User = require('./User');
const Transaction = require('./Transaction');
const ForgotPassword = require('./ForgotPassword');
const Payment = require('./Payment');
const ReportLog = require('./ReportLog');

// Associations

// User aur Transactions
User.hasMany(Transaction, { foreignKey: 'userId', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

// User aur Forgot Password
User.hasMany(ForgotPassword, { foreignKey: 'userId', onDelete: 'CASCADE' });
ForgotPassword.belongsTo(User, { foreignKey: 'userId' });

// User aur Payments (Membership)
User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });

// User aur Reports
User.hasMany(ReportLog, { foreignKey: 'userId' });
ReportLog.belongsTo(User, { foreignKey: 'userId' });

const db = {
    sequelize,
    User,
    Transaction,
    ForgotPassword,
    Payment,
    ReportLog
};

module.exports = db;
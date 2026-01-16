const Payment = require('../models/Payment');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/db');
const { createCashfreeOrder, verifyCashfreePayment } = require('../services/cashfree');

// === CREATE ORDER ===
exports.createOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user.userId;
        const userEmail = req.user.email;
        const userName = req.user.name;

        const orderId = `ORDER_${uuidv4().split('-')[0]}`; 

        const cashfreeData = await createCashfreeOrder({
            orderId: orderId,
            amount: amount,
            customerId: userId,
            customerName: userName,
            customerPhone: "9999999999" 
        });

        await Payment.create({
            orderId: orderId,
            amount: amount,
            userId: userId,
            status: 'PENDING'
        });

        res.status(200).json({
            success: true,
            orderId: cashfreeData.order_id,
            paymentSessionId: cashfreeData.payment_session_id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

//===== VERIFY PAYMENT ====

exports.verifyPayment = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { orderId } = req.body;

        const paymentRecord = await Payment.findOne({ where: { orderId } });

        if (!paymentRecord) {
            await t.rollback();
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const userId = paymentRecord.userId;

        const verification = await verifyCashfreePayment(orderId);

        if (verification.status === "SUCCESSFUL") {
       
            await Payment.update(
                { 
                    status: 'SUCCESSFUL', 
                    paymentId: verification.paymentId 
                },
                { where: { orderId: orderId }, transaction: t }
            );

            await User.update(
                { isPremium: true },
                { where: { id: userId }, transaction: t }
            );

            await t.commit();

            res.status(200).json({
                success: true,
                message: "Payment Verified! Premium Activated 👑",
                isPremium: true
            });

        } else {
            
            await t.rollback();
            res.status(400).json({ success: false, message: "Payment Verification Failed" });
        }

    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
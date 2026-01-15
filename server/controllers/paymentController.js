const Payment = require('../models/Payment');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/db');
const { createCashfreeOrder, verifyCashfreePayment } = require('../services/cashfree');

// ================= CREATE ORDER =================
exports.createOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user.userId;
        const userEmail = req.user.email;
        const userName = req.user.name;

        // 1. Unique Order ID Generate karo
        const orderId = `ORDER_${uuidv4().split('-')[0]}`; // e.g., ORDER_a1b2c3

        // 2. Cashfree Service Call karo
        const cashfreeData = await createCashfreeOrder({
            orderId: orderId,
            amount: amount,
            customerId: userId,
            customerName: userName,
            customerPhone: "9999999999" // User model me phone nahi hai isliye dummy
        });

        // 3. DB me 'PENDING' entry save karo (Tracking ke liye)
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

// ================= VERIFY PAYMENT =================

exports.verifyPayment = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { orderId } = req.body;

        // 1. Sabse pehle DB me check karo ye Order kiska hai
        // (Token ki zarurat nahi, Order ID hi kaafi hai)
        const paymentRecord = await Payment.findOne({ where: { orderId } });

        if (!paymentRecord) {
            await t.rollback();
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // User ID humne table se nikal li
        const userId = paymentRecord.userId;

        // 2. Cashfree se confirm karo status
        const verification = await verifyCashfreePayment(orderId);

        if (verification.status === "SUCCESSFUL") {
            
            // 3. Payment Table Update
            await Payment.update(
                { 
                    status: 'SUCCESSFUL', 
                    paymentId: verification.paymentId 
                },
                { where: { orderId: orderId }, transaction: t }
            );

            // 4. User ko Premium banao
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
            // Agar Cashfree bole Pending/Failed
            await t.rollback();
            res.status(400).json({ success: false, message: "Payment Verification Failed" });
        }

    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
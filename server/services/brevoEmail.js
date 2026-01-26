const Brevo = require("@getbrevo/brevo");
require('dotenv').config();

// Brevo Setup
const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

exports.sendResetEmail = async (email, resetToken) => {
    try {
        const resetLink = `http://localhost:5000/forget_password/${resetToken}`;

        const sendSmtpEmail = new Brevo.SendSmtpEmail();

        sendSmtpEmail.sender = {
            email: "pp5395021@gmail.com", 
            name: "Expense Tracker"
        };

        sendSmtpEmail.to = [{ email: email }];
        sendSmtpEmail.subject = "Password Reset Request";

        sendSmtpEmail.htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h3 style="color: #4F46E5;">Password Reset Request</h3>
                <p>You requested to reset your password. Click the link below to proceed:</p>
                
                <a href="${resetLink}" style="
                    background-color: #4F46E5; 
                    color: white; 
                    padding: 10px 20px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    display: inline-block;
                    margin-top: 10px;">
                    Reset Password
                </a>

                <p style="margin-top: 20px; color: gray; font-size: 12px;">
                    This link expires in 1 hour. If you did not request this, please ignore this email.
                </p>
            </div>
        `;

        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log("Email Sent Successfully via Brevo");
        return true;

    } catch (err) {
        console.error("Email Error:", err.response?.text || err.message);
        return false;
    }
};
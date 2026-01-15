const jwt = require("jsonwebtoken");
const User = require("../models/User"); 
require("dotenv").config();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    //console.log("Auth Header:", authHeader);


    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access Denied: No Token Provided"
      });
    }

    const token = authHeader.split(" ")[1];

    //console.log("Extracted Token:", token);


    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //console.log("Decoded Payload:", decoded);


    // DB se fresh user fetch karo
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      //console.log("User DB me nahi mila (ID mismatch)");
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }
    //console.log("User Found:", user.email);
    // req.user me current info set
    req.user = {
      userId: user.id,
      name: user.name,
      email: user.email,
      isPremium: user.isPremium,
      totalIncome: user.totalIncome,
      totalExpense: user.totalExpense
    };

    next();
  } catch (err) {
    console.err("JWT Error:", err.message);
    res.status(401).json({
      success: false,
      message: "Invalid or Expired Token"
    });
  }
};

module.exports = authenticate;

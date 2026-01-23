const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
require("./models");
const sequelize = require("./config/db");
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.use(express.static(path.join(__dirname, 'public')));
// routes
const transactionRoutes = require('./routes/transactionRoutes');
const authRoutes = require('./routes/authRoute');
const dashboardRoutes = require('./routes/dashboardRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reportRoutes = require('./routes/reportRoutes');


app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reports', reportRoutes);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login_signup.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'dashboard.html'));
});

app.get('/transactions.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'transactions.html'));
});

app.get('/report.html', (req,res)=>{
  res.sendFile(path.join(__dirname, 'public', 'html', 'report.html'))
})


sequelize.sync({alter:true})
  .then(() => console.log("Database Connected Successfully"))
  .catch(err => console.log("DB Connection Failed:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

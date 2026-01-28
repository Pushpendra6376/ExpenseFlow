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
const profileRoute = require('./routes/profileRoutes')

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/profile', profileRoute)

app.get('/forget_password/:token', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'forget_password.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login_signup.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'dashboard.html'));
});

app.get('/transaction.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'transaction.html'));
});

app.get('/report.html', (req,res)=>{
  res.sendFile(path.join(__dirname, 'public', 'html', 'report.html'))
})

app.get('/profile.html', (req,res)=>{
  res.sendFile(path.join(__dirname, 'public', 'html', 'profile.html'))
})

app.get('/leaderboard.html', (req,res)=>{
  res.sendFile(path.join(__dirname, 'public', 'html', 'leaderboard.html'))
})

app.get('/payment_status.html', (req,res)=>{
  res.sendFile(path.join(__dirname, 'public', 'html', 'payment_status.html'))
})


sequelize.sync()
  .then(() => console.log("Database Connected Successfully"))
  .catch(err => console.log("DB Connection Failed:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

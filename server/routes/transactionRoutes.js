const express = require('express');
const router = express.Router();
const { addTransaction, getAllTransactions, deleteTransaction, updateTransaction } = require('../controllers/transactionController');
const authenticate = require('../middleware/AuthMiddleware'); 

router.post('/add', authenticate, addTransaction);
router.get('/get', authenticate, getAllTransactions);
router.delete('/delete/:id', authenticate, deleteTransaction);
router.put('/:id', authenticate, updateTransaction);

module.exports = router;
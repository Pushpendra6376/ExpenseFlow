"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface) {

    // Find manually created user
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM Users WHERE name = 'Pushpendra6376' LIMIT 1`
    );

    if (!users.length) {
      console.log(" User Pushpendra6376 not found. Seeder skipped.");
      return;
    }

    const userId = users[0].id;
    const transactions = [];

    let totalIncome = 0;
    let totalExpense = 0;

    // 900 EXPENSES
    for (let i = 0; i < 900; i++) {
      const amt = Math.floor(Math.random() * 500) + 50;
      totalExpense += amt;

      transactions.push({
        id: uuidv4(),
        userId,
        type: "expense",
        amount: amt,
        category: "Food",
        description: "Pagination expense seed",
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // 600 INCOMES
    for (let i = 0; i < 600; i++) {
      const amt = Math.floor(Math.random() * 2000) + 500;
      totalIncome += amt;

      transactions.push({
        id: uuidv4(),
        userId,
        type: "income",
        amount: amt,
        category: "Salary",
        description: "Pagination income seed",
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }


    await queryInterface.bulkInsert("Transactions", transactions);

    await queryInterface.bulkUpdate(
      "Users",
      {
        totalIncome,
        totalExpense,
        updatedAt: new Date()
      },
      { id: userId }
    );

    console.log("Manual user seeded with 1500 transactions");
  },

  async down(queryInterface) {
    // Optional cleanup (safe)
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM Users WHERE name = 'Pushpendra6376' LIMIT 1`
    );

    if (!users.length) return;

    await queryInterface.bulkDelete("Transactions", {
      userId: users[0].id
    });
  }
};

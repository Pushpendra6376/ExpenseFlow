"use strict";
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    const users = [];
    const transactions = [];

    for (let i = 1; i <= 100; i++) {
      const userId = uuidv4();
      let totalIncome = 0;
      let totalExpense = 0;

      users.push({
        id: userId,
        name: `User ${i}`,
        email: `user${i}@mail.com`,
        password: await bcrypt.hash("123456", 10),
        isPremium: false,
        totalIncome: 0,
        totalExpense: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 1000 expenses
      for (let e = 0; e < 1000; e++) {
        const amt = Math.floor(Math.random() * 500) + 50;
        totalExpense += amt;

        transactions.push({
          id: uuidv4(),
          userId,
          type: "expense",
          amount: amt,
          category: "Food",
          description: "Seed expense",
          date: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // 500 incomes
      for (let j = 0; j < 500; j++) {
        const amt = Math.floor(Math.random() * 2000) + 500;
        totalIncome += amt;

        transactions.push({
          id: uuidv4(),
          userId,
          type: "income",
          amount: amt,
          category: "Salary",
          description: "Seed income",
          date: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      users[i - 1].totalIncome = totalIncome;
      users[i - 1].totalExpense = totalExpense;
    }

    await queryInterface.bulkInsert("Users", users);
    await queryInterface.bulkInsert("Transactions", transactions);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Transactions", null, {});
    await queryInterface.bulkDelete("Users", null, {});
  },
};



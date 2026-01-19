import { createContext, useContext, useState } from "react";

const ExpenseContext = createContext(undefined);

const initialTransactions = [
  {
    id: 1,
    amount: 5000,
    category: "Salary",
    description: "Monthly salary",
    date: "2026-01-01",
    type: "income",
  },
  {
    id: 2,
    amount: 1200,
    category: "Rent",
    description: "Monthly rent",
    date: "2026-01-02",
    type: "expense",
  },
  {
    id: 3,
    amount: 85.5,
    category: "Food",
    description: "Groceries",
    date: "2026-01-05",
    type: "expense",
  },
  {
    id: 4,
    amount: 45,
    category: "Transport",
    description: "Uber rides",
    date: "2026-01-07",
    type: "expense",
  },
  {
    id: 5,
    amount: 120,
    category: "Entertainment",
    description: "Concert tickets",
    date: "2026-01-08",
    type: "expense",
  },
  {
    id: 6,
    amount: 500,
    category: "Freelance",
    description: "Design project",
    date: "2026-01-09",
    type: "income",
  },
  {
    id: 7,
    amount: 65,
    category: "Utilities",
    description: "Electric bill",
    date: "2026-01-10",
    type: "expense",
  },
  {
    id: 8,
    amount: 200,
    category: "Shopping",
    description: "New clothes",
    date: "2026-01-11",
    type: "expense",
  },
];

export function ExpenseProvider({ children }) {
  const [transactions, setTransactions] = useState(initialTransactions);

  const addTransaction = (tx) => {
    const newId =
      Math.max(0, ...transactions.map((t) => t.id)) + 1;

    setTransactions([{ ...tx, id: newId }, ...transactions]);
  };

  const updateTransaction = (id, tx) => {
    setTransactions(
      transactions.map((t) =>
        t.id === id ? { ...tx, id } : t
      )
    );
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        totalIncome,
        totalExpense,
        balance,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error(
      "useExpenses must be used within ExpenseProvider"
    );
  }
  return context;
}

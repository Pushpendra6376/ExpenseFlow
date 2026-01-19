import { useMemo } from "react";
import { AppLayout } from "../components1/layout/app-layout";
import { useAuth } from "../lib/auth-context";
import { useExpenses } from "../lib/expense-context";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";

const COLORS = [
  "hsl(262 83% 58%)",
  "hsl(199 89% 48%)",
  "hsl(142 76% 36%)",
  "hsl(45 93% 47%)",
  "hsl(0 84% 60%)",
  "hsl(280 80% 55%)",
  "hsl(180 70% 45%)",
];

const categoryIcons = {
  Food: "🍔",
  Transport: "🚗",
  Rent: "🏠",
  Salary: "💰",
  Freelance: "💼",
  Entertainment: "🎬",
  Utilities: "💡",
  Shopping: "🛍️",
  Investment: "📈",
  Gift: "🎁",
  Other: "📦",
};

export default function ReportsPage() {
  const { user } = useAuth();
  const { transactions, totalIncome, totalExpense } = useExpenses();
  const currency = user?.currency || "$";

  const categoryData = useMemo(() => {
    const expenses = transactions.filter((tx) => tx.type === "expense");
    const grouped = {};
    expenses.forEach((tx) => {
      grouped[tx.category] = (grouped[tx.category] || 0) + tx.amount;
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const months = {};
    transactions.forEach((tx) => {
      const date = parseISO(tx.date);
      const key = format(date, "MMM yyyy");
      if (!months[key]) months[key] = { income: 0, expense: 0 };
      if (tx.type === "income") months[key].income += tx.amount;
      else months[key].expense += tx.amount;
    });
    return Object.entries(months)
      .map(([name, data]) => ({ name, ...data }))
      .slice(-6);
  }, [transactions]);

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  return (
    <AppLayout>
      <div className="space-y-8 animate-in">
        <div>
          <h1 className="text-3xl font-bold mb-1">Reports & Analytics</h1>
          <p className="text-muted-foreground">Visualize your spending patterns</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-5 border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
            <p className="text-sm text-muted-foreground mb-1">Total Income</p>
            <p className="text-2xl font-bold text-emerald-600">
              {currency}
              {totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="glass rounded-2xl p-5 border border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-rose-500/5">
            <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-rose-600">
              {currency}
              {totalExpense.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="glass rounded-2xl p-5 border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <p className="text-sm text-muted-foreground mb-1">Savings Rate</p>
            <p className="text-2xl font-bold text-blue-600">{savingsRate.toFixed(1)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-strong rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Spending by Category</h2>
            {categoryData.length > 0 ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            strokeWidth={0}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${currency}${value.toFixed(2)}`, "Amount"]}
                        contentStyle={{
                          background: "rgba(255,255,255,0.95)",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {categoryData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-muted-foreground">
                        {categoryIcons[item.name]} {item.name}
                      </span>
                      <span className="ml-auto font-medium">
                        {currency}
                        {item.value.toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No expense data to display
              </div>
            )}
          </div>

          <div className="glass-strong rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Monthly Income vs Expense</h2>
            {monthlyData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(270 20% 90%)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "hsl(270 15% 45%)" }}
                      axisLine={{ stroke: "hsl(270 20% 90%)" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "hsl(270 15% 45%)" }}
                      axisLine={{ stroke: "hsl(270 20% 90%)" }}
                      tickFormatter={(value) => `${currency}${value}`}
                    />
                    <Tooltip
                      formatter={(value) => [`${currency}${value.toFixed(2)}`]}
                      contentStyle={{
                        background: "rgba(255,255,255,0.95)",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="hsl(142 76% 36%)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="hsl(0 84% 60%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-muted-foreground">
                No data to display
              </div>
            )}
          </div>
        </div>

        <div className="glass-strong rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Top Expenses</h2>
          <div className="space-y-3">
            {transactions
              .filter((tx) => tx.type === "expense")
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5)
              .map((tx, index) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-muted/30"
                >
                  <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-lg">
                    {categoryIcons[tx.category] || "📦"}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">{tx.category}</p>
                  </div>
                  <span className="font-bold text-rose-600">
                    -{currency}
                    {tx.amount.toFixed(2)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

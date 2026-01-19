import { Link } from "wouter";
import { AppLayout } from "../components1/layout/app-layout";
import { useAuth } from "../lib/auth-context";
import { useExpenses } from "../lib/expense-context";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "../lib/utils";

const categoryIcons = {
  Food: "🍔",
  Transport: "🚗",
  Rent: "🏠",
  Salary: "💰",
  Freelance: "💼",
  Entertainment: "🎬",
  Utilities: "💡",
  Shopping: "🛍️",
  Other: "📦",
};

function SummaryCard({ title, amount, icon: Icon, variant, currency }) {
  const variants = {
    income: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20",
    expense: "from-rose-500/10 to-rose-500/5 border-rose-500/20",
    balance: "from-primary/10 to-primary/5 border-primary/20",
  };

  const iconVariants = {
    income: "bg-emerald-500/20 text-emerald-600",
    expense: "bg-rose-500/20 text-rose-600",
    balance: "gradient-primary text-white",
  };

  return (
    <div
      className={cn(
        "glass rounded-2xl p-5 border bg-gradient-to-br transition-all duration-300 hover:shadow-lg",
        variants[variant]
      )}
      data-testid={`card-${variant}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            iconVariants[variant]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-2xl font-bold tracking-tight">
        {currency}
        {amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

function TransactionItem({ tx, currency }) {
  return (
    <div
      className="flex items-center gap-4 py-4 border-b border-border/50 last:border-0 group"
      data-testid={`transaction-${tx.id}`}
    >
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-xl">
        {categoryIcons[tx.category] || "📦"}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{tx.description}</p>
        <p className="text-sm text-muted-foreground">
          {tx.category} · {format(parseISO(tx.date), "MMM d")}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {tx.type === "income" ? (
          <ArrowUpRight className="w-4 h-4 text-emerald-500" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-rose-500" />
        )}

        <span
          className={cn(
            "font-semibold tabular-nums",
            tx.type === "income" ? "text-emerald-600" : "text-rose-600"
          )}
        >
          {tx.type === "income" ? "+" : "-"}
          {currency}
          {tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { transactions, totalIncome, totalExpense, balance } = useExpenses();
  const currency = user?.currency || "$";
  const recentTransactions = transactions.slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-8 animate-in">
        <div>
          <h1 className="text-3xl font-bold mb-1">
            Hello, {user?.username || "there"}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's your financial overview
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            title="Total Income"
            amount={totalIncome}
            icon={TrendingUp}
            variant="income"
            currency={currency}
          />
          <SummaryCard
            title="Total Expense"
            amount={totalExpense}
            icon={TrendingDown}
            variant="expense"
            currency={currency}
          />
          <SummaryCard
            title="Current Balance"
            amount={balance}
            icon={Wallet}
            variant="balance"
            currency={currency}
          />
        </div>

        <div className="glass-strong rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Recent Transactions</h2>
            <Link
              href="/add"
              className="text-sm text-primary font-medium hover:underline"
              data-testid="link-view-all"
            >
              View all
            </Link>
          </div>

          {recentTransactions.length > 0 ? (
            <div>
              {recentTransactions.map((tx) => (
                <TransactionItem key={tx.id} tx={tx} currency={currency} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No transactions yet</p>
              <p className="text-sm">
                Add your first transaction to get started
              </p>
            </div>
          )}
        </div>
      </div>

      <Link href="/add">
        <button
          className="lg:hidden fixed right-6 bottom-24 w-14 h-14 rounded-full gradient-primary shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all duration-200 active:scale-95"
          data-testid="button-fab-add"
        >
          <Plus className="w-6 h-6" />
        </button>
      </Link>
    </AppLayout>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "../components1/layout/app-layout";
import { useAuth } from "../lib/auth-context";
import { useExpenses } from "../lib/expense-context";
import { Button } from "../components1/ui/button";
import { Input } from "../components1/ui/input";
import { Label } from "../components1/ui/label";
import { Textarea } from "../components1/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components1/ui/select";
import { useToast } from "../hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "../components1/ui/tabs";
import { format, parseISO } from "date-fns";
import {
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Pencil,
  Search,
  Filter,
} from "lucide-react";
import { cn } from "../lib/utils";

const categories = {
  expense: ["Food", "Transport", "Rent", "Entertainment", "Utilities", "Shopping", "Other"],
  income: ["Salary", "Freelance", "Investment", "Gift", "Other"],
};

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

export default function AddTransactionPage() {
  const { user } = useAuth();
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useExpenses();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const currency = user?.currency || "$";

  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [editingId, setEditingId] = useState(null);

  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = transactions.filter((tx) => {
    const matchesCategory = filterCategory === "all" || tx.category === filterCategory;
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount || !category || !description) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const txData = {
      amount: parseFloat(amount),
      category,
      description,
      date,
      type,
    };

    if (editingId) {
      updateTransaction(editingId, txData);
      toast({ title: "Transaction updated!" });
      setEditingId(null);
    } else {
      addTransaction(txData);
      toast({ title: "Transaction added!" });
    }

    setAmount("");
    setCategory("");
    setDescription("");
    setDate(format(new Date(), "yyyy-MM-dd"));
  };

  const handleEdit = (tx) => {
    setEditingId(tx.id);
    setType(tx.type);
    setAmount(tx.amount.toString());
    setCategory(tx.category);
    setDescription(tx.description);
    setDate(tx.date);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    deleteTransaction(id);
    toast({ title: "Transaction deleted" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAmount("");
    setCategory("");
    setDescription("");
    setDate(format(new Date(), "yyyy-MM-dd"));
  };

  const allCategories = Array.from(new Set(transactions.map((tx) => tx.category)));

  return (
    <AppLayout>
      <div className="space-y-8 animate-in">
        <div>
          <h1 className="text-3xl font-bold mb-1">
            {editingId ? "Edit Transaction" : "Add Transaction"}
          </h1>
          <p className="text-muted-foreground">
            {editingId ? "Update your transaction details" : "Record a new income or expense"}
          </p>
        </div>

        <div className="glass-strong rounded-3xl p-6 shadow-sm">
          <Tabs value={type} onValueChange={setType}>
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger
                value="expense"
                className="rounded-lg data-[state=active]:bg-rose-500 data-[state=active]:text-white"
              >
                <ArrowDownRight className="w-4 h-4 mr-2" />
                Expense
              </TabsTrigger>

              <TabsTrigger
                value="income"
                className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Income
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Amount ({currency})</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 rounded-xl text-lg font-semibold"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories[type].map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {categoryIcons[cat]} {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                {editingId && (
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  className={cn(
                    "flex-1 h-12 rounded-xl text-white font-semibold",
                    type === "expense"
                      ? "bg-rose-500 hover:bg-rose-600"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  )}
                >
                  {editingId ? "Update" : "Add"} {type}
                </Button>
              </div>
            </form>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}

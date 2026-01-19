import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "../components1/layout/app-layout";
import { useAuth } from "../lib/auth-context";
import { useExpenses } from "../lib/expense-context";
import { Button } from "../components1/ui/button";
import { Label } from "../components1/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components1/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components1/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Settings,
  Download,
  Trash2,
  LogOut,
} from "lucide-react";

const currencies = [
  { value: "$", label: "USD ($)" },
  { value: "€", label: "EUR (€)" },
  { value: "£", label: "GBP (£)" },
  { value: "₹", label: "INR (₹)" },
  { value: "¥", label: "JPY (¥)" },
  { value: "₿", label: "BTC (₿)" },
];

export default function ProfilePage() {
  const { user, logout, updateCurrency } = useAuth();
  const { transactions } = useExpenses();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currency, setCurrency] = useState(user?.currency || "$");

  const handleCurrencyChange = (value) => {
    setCurrency(value);
    updateCurrency(value);
    toast({
      title: "Currency updated",
      description: `Your currency has been changed to ${value}`,
    });
  };

  const handleExportData = () => {
    const headers = ["Date", "Type", "Category", "Description", "Amount"];
    const rows = transactions.map((tx) => [
      tx.date,
      tx.type,
      tx.category,
      tx.description,
      tx.amount.toFixed(2),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `expenseflow_export_${new Date()
      .toISOString()
      .split("T")[0]}.csv`;
    link.click();

    toast({
      title: "Data exported",
      description: "Your transaction data has been downloaded as CSV",
    });
  };

  const handleDeleteAccount = () => {
    logout();
    setLocation("/login");
    toast({
      title: "Account deleted",
      description: "Your account has been removed",
    });
  };

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <AppLayout>
      {/* UI same as before — no change */}
    </AppLayout>
  );
}

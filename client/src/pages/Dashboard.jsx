import { useEffect, useState } from 'react';
import api from '../utils/api'; 
import Navbar from '../components1/Navbar';
import AddTransactionModal from '../components1/AddTransactionModal';
import { FaArrowUp, FaArrowDown, FaRupeeSign, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Chart Import
import { toast } from 'react-toastify';

// Colors for Pie Chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null); // Edit ke liye state
  
  const [dashboardData, setDashboardData] = useState({
    userTotals: { totalIncome: 0, totalExpense: 0, balance: 0 },
    recentTransactions: [],
    categoryStats: [] // Chart data
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/dashboard/stats'); 
      if (data.success) {
        setDashboardData({
            userTotals: data.userTotals,
            recentTransactions: data.recentTransactions,
            categoryStats: data.categoryStats || [] // Backend se aaya naya data
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Delete Function
  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
        await api.delete(`/transactions/${id}`);
        toast.success("Transaction Deleted");
        fetchDashboardData(); // Refresh data
    } catch (error) {
        toast.error("Failed to delete");
    }
  };

  // Edit Function (Modal open karega purane data ke saath)
  const handleEdit = (txn) => {
    setEditData(txn); // Data set kiya
    setIsModalOpen(true); // Modal khola
  };

  const { userTotals, recentTransactions, categoryStats } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <button 
                onClick={() => { setEditData(null); setIsModalOpen(true); }}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-lg font-medium"
            >
                <FaPlus /> Add New
            </button>
        </div>

        {/* --- Section 1: Stats & Charts (Grid Layout) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Summary Cards */}
            <div className="lg:col-span-2 space-y-6">
                {/* Balance Card */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg opacity-90">Total Balance</h3>
                    <div className="text-4xl font-bold flex items-center mt-2">
                    <FaRupeeSign className="text-3xl" /> {userTotals.balance}
                    </div>
                </div>

                {/* Income & Expense Row */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                        <h3 className="text-gray-500 text-sm font-bold uppercase">Income</h3>
                        <div className="text-2xl font-bold text-green-600 flex items-center mt-2 gap-2">
                        <FaArrowUp /> ₹{userTotals.totalIncome}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                        <h3 className="text-gray-500 text-sm font-bold uppercase">Expense</h3>
                        <div className="text-2xl font-bold text-red-600 flex items-center mt-2 gap-2">
                        <FaArrowDown /> ₹{userTotals.totalExpense}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Pie Chart 📊 */}
            <div className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center justify-center min-h-[300px]">
                <h3 className="text-gray-700 font-bold mb-2">Expense Breakdown</h3>
                {categoryStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={categoryStats}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="totalAmount"
                                nameKey="category"
                            >
                                {categoryStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `₹${value}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-gray-400 text-sm">No expense data to show chart.</p>
                )}
            </div>
        </div>

        {/* --- Section 2: Recent Transactions with Actions --- */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
          {loading ? (
            <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : recentTransactions.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No transactions found.</p>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((txn) => (
                <div key={txn.id} className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-gray-50 transition group">
                  
                  {/* Left: Icon & Details */}
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${txn.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      <FaRupeeSign />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{txn.description || "No Description"}</p>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        {txn.category} • {new Date(txn.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center gap-4">
                    <div className={`font-bold text-lg ${txn.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {txn.type === 'income' ? '+' : '-'} ₹{txn.amount}
                    </div>
                    
                    {/* Action Buttons (Hover pe dikhenge) */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => handleEdit(txn)}
                            className="text-blue-500 hover:text-blue-700 p-2 bg-blue-50 rounded-full"
                            title="Edit"
                        >
                            <FaEdit />
                        </button>
                        <button 
                            onClick={() => handleDelete(txn.id)}
                            className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-full"
                            title="Delete"
                        >
                            <FaTrash />
                        </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modal ko editData pass karein */}
      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        refreshData={fetchDashboardData}
        editData={editData} // Agar editData hai to Modal pre-filled khulega
      />

    </div>
  );
};

export default Dashboard;
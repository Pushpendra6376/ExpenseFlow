import { useEffect, useState } from 'react';
import api from '../utils/api'; 
import Navbar from '../components/Navbar';
import AddTransactionModal from '../components/AddTransactionModal';
import { FaArrowUp, FaArrowDown, FaRupeeSign, FaPlus } from 'react-icons/fa';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [dashboardData, setDashboardData] = useState({
    userTotals: { totalIncome: 0, totalExpense: 0, balance: 0 },
    recentTransactions: [],
  });

  // --- Data Fetching Function ---
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Backend se data mangwa rahe hain
      const { data } = await api.get('/dashboard/stats'); 
      
      if (data.success) {
        setDashboardData({
            userTotals: data.userTotals,
            recentTransactions: data.recentTransactions,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const { userTotals, recentTransactions } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        
        {/* Header + Add Button */}
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-lg font-medium"
            >
                <FaPlus /> Add New
            </button>
        </div>

        {/* --- Summary Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Balance */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition duration-300">
            <h3 className="text-lg opacity-90">Total Balance</h3>
            <div className="text-3xl font-bold flex items-center mt-2">
              <FaRupeeSign className="text-2xl" /> {userTotals.balance}
            </div>
          </div>

          {/* Income */}
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Income</h3>
            <div className="text-2xl font-bold text-green-600 flex items-center mt-2 gap-2">
              <FaArrowUp /> ₹{userTotals.totalIncome}
            </div>
          </div>

          {/* Expense */}
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Expense</h3>
            <div className="text-2xl font-bold text-red-600 flex items-center mt-2 gap-2">
              <FaArrowDown /> ₹{userTotals.totalExpense}
            </div>
          </div>
        </div>

        {/* --- Recent Transactions List --- */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
          {loading ? (
            <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : recentTransactions.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No transactions found. Click "Add New" to start!</p>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((txn) => (
                // ✅ Fix: Key mein 'txn.id' use kiya hai
                <div key={txn.id} className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${txn.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      <FaRupeeSign />
                    </div>
                    <div>
                      {/* ✅ Fix: Ab yahan 'description' show hoga */}
                      <p className="font-bold text-gray-800">{txn.description || "No Description"}</p>
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
                        {txn.category} • {new Date(txn.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold text-lg ${txn.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {txn.type === 'income' ? '+' : '-'} ₹{txn.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modal */}
      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        refreshData={fetchDashboardData} 
      />

    </div>
  );
};

export default Dashboard;
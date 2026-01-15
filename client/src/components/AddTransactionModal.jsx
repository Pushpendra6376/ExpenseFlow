import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../utils/api';

const AddTransactionModal = ({ isOpen, onClose, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense', // Default
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0] // Today's date
  });

  const categories = ["Food", "Petrol", "Shopping", "Travel", "Bills", "Entertainment", "Health", "Salary", "Investment"];

  if (!isOpen) return null; // Agar modal band hai to kuch mat dikhao

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Backend API Call
      await api.post('/transactions/add', formData);
      
      toast.success("Transaction Added Successfully! 🎉");
      
      // Dashboard data refresh karo
      refreshData();
      
      // Modal band karo aur form reset karo
      onClose();
      setFormData({ amount: '', type: 'expense', category: '', description: '', date: new Date().toISOString().split('T')[0] });

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-fadeIn">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Add Transaction</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
            <FaTimes size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Type Toggle */}
          <div className="flex gap-4 mb-4">
            <label className={`flex-1 text-center py-2 rounded-lg cursor-pointer border ${formData.type === 'expense' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600'}`}>
              <input type="radio" name="type" value="expense" className="hidden" onChange={handleChange} checked={formData.type === 'expense'} />
              Expense
            </label>
            <label className={`flex-1 text-center py-2 rounded-lg cursor-pointer border ${formData.type === 'income' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600'}`}>
              <input type="radio" name="type" value="income" className="hidden" onChange={handleChange} checked={formData.type === 'income'} />
              Income
            </label>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
            <input type="number" name="amount" required value={formData.amount} onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 500" />
          </div>

          {/* Description (AI ke liye important) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input type="text" name="description" required value={formData.description} onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. McDonald's Burger" />
            <p className="text-xs text-gray-500 mt-1">💡 Pro Tip: Describe clearly for AI Auto-Categorization!</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select name="category" value={formData.category} onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">✨ Auto (Let AI Decide)</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading}
            className="w-full py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400">
            {loading ? "Adding..." : "Add Transaction"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
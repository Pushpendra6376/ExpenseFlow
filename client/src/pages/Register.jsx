import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Backend call
      await api.post('/auth/signup', formData);
      
      // Success
      toast.success("Registration Successful! Please Login. 🎉");
      
      // Login page par bhej do
      navigate('/login');

    } catch (error) {
      toast.error(error.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-800">Create Account 🚀</h2>
        <p className="text-center text-gray-500">Join ExpenseFlow today!</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="John Doe"
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              onChange={handleChange}
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              required
              placeholder="john@example.com"
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              onChange={handleChange}
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="******"
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
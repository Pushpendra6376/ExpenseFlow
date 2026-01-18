import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaWallet, FaSignOutAlt } from 'react-icons/fa'; // Icons

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')); // User ka naam nikalne ke liye

  const handleLogout = () => {
    // 1. Data saaf karo
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 2. User ko feedback do
    toast.info("Logged out successfully");
    
    // 3. Login page par bhejo
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      {/* Left: Logo */}
      <Link to="/dashboard" className="flex items-center gap-2 text-2xl font-bold text-blue-600">
        <FaWallet /> ExpenseFlow
      </Link>

      {/* Right: User Info & Logout */}
      <div className="flex items-center gap-6">
        <span className="text-gray-600 font-medium hidden md:block">
          Hello, {user?.name || 'User'} 👋
        </span>
        
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium transition"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
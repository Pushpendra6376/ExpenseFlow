import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages Import
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// 🛡️ Protected Route Component (Security Guard)
// Ye check karega ki User ke paas Token hai ya nahi
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Agar token nahi hai, to Login par bhejo
    return <Navigate to="/login" replace />;
  }
  
  // Agar token hai, to andar jane do
  return children;
};

function App() {
  return (
    <BrowserRouter>
      {/* Toast Notifications (Popups ke liye) */}
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Routes>
        {/* === Public Routes (Koi bhi dekh sakta hai) === */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* === Private Routes (Sirf Logged In Users ke liye) === */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Default Route: Agar koi "/" par aaye to Dashboard par bhejo (Jo check karke Login bhej dega) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Agar koi galat URL dale to wapis Login par bhejo */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
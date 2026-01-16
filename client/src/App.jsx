import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Footer from './components/Footer'; // ✅ Footer Import kiya

// Pages Import
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';

// 🛡️ Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        {/* Toast Notifications */}
        <ToastContainer position="top-right" autoClose={3000} />
        
        <div className="flex-grow">
          <Routes>
            {/* === Public Routes === */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />

            {/* === Private Routes === */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* Default Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>

        {/* ✅ Footer ab har page par dikhega */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
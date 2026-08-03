import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Preview from './pages/Preview';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('buildmywebsiteai_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RootRedirect = () => {
  const token = localStorage.getItem('buildmywebsiteai_token');
  if (token) {
    try {
      const user = JSON.parse(localStorage.getItem('buildmywebsiteai_user') || '{}');
      if (user.is_admin || user.email === 'admin@buildmywebsiteai.ai') {
        return <Navigate to="/admin" replace />;
      }
    } catch (e) {}
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
};

/* Cross-Tab Authentication & Session Synchronization Listener */
const AuthSyncListener = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'buildmywebsiteai_token' || e.key === 'buildmywebsiteai_user') {
        const token = localStorage.getItem('buildmywebsiteai_token');
        const userStr = localStorage.getItem('buildmywebsiteai_user');

        // Scenario 1: User signed out in another tab -> Automatically sign out this tab
        if (!token || !userStr) {
          navigate('/login', { replace: true });
          return;
        }

        // Scenario 2: User logged into a different account in another tab -> Automatically switch session
        try {
          const user = JSON.parse(userStr);
          if (user.is_admin || user.email === 'admin@buildmywebsiteai.ai') {
            if (location.pathname !== '/admin') {
              navigate('/admin', { replace: true });
              window.location.reload();
            }
          } else {
            if (location.pathname === '/admin') {
              navigate('/dashboard', { replace: true });
              window.location.reload();
            } else {
              window.location.reload();
            }
          }
        } catch (err) {
          navigate('/login', { replace: true });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate, location]);

  return children;
};

function App() {
  return (
    <Router>
      <AuthSyncListener>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/preview/:id"
            element={
              <ProtectedRoute>
                <Preview />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthSyncListener>
    </Router>
  );
}

export default App;

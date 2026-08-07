import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import ShowcasePage from './pages/ShowcasePage';
import HowItWorksPage from './pages/HowItWorksPage';
import PricingPage from './pages/PricingPage';
import FAQPage from './pages/FAQPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Preview from './pages/Preview';
import AdminDashboard from './pages/AdminDashboard';
import CustomCursor from './components/CustomCursor';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('buildmywebsiteai_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
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

        const publicRoutes = ['/', '/features', '/showcase', '/how-it-works', '/pricing', '/faq', '/login', '/signup'];

        // Scenario 1: User signed out in another tab -> Automatically sign out this tab if on protected route
        if (!token || !userStr) {
          if (!publicRoutes.includes(location.pathname)) {
            navigate('/', { replace: true });
          }
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
    <ThemeProvider>
      <CustomCursor />
      <Router>
        <AuthSyncListener>
          <Routes>
            {/* Multi-Page Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/showcase" element={<ShowcasePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/faq" element={<FAQPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected Routes */}
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
    </ThemeProvider>
  );
}

export default App;

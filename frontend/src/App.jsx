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
import AIChatbot from './components/AIChatbot';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('buildmywebsiteai_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Validate JWT expiration and integrity
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        localStorage.removeItem('buildmywebsiteai_token');
        localStorage.removeItem('buildmywebsiteai_user');
        return <Navigate to="/login" replace />;
      }
    }
  } catch (e) {
    // Malformed token
    localStorage.removeItem('buildmywebsiteai_token');
    localStorage.removeItem('buildmywebsiteai_user');
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
      // Only react if authentication token changed across tabs
      if (e.key === 'buildmywebsiteai_token') {
        const token = localStorage.getItem('buildmywebsiteai_token');
        const publicRoutes = ['/', '/features', '/showcase', '/how-it-works', '/faq', '/login', '/signup'];

        if (!token) {
          // User signed out in another tab
          if (!publicRoutes.includes(location.pathname)) {
            navigate('/login', { replace: true });
          }
        } else {
          // User signed in from another tab while on login/signup
          if (location.pathname === '/login' || location.pathname === '/signup') {
            navigate('/dashboard', { replace: true });
          }
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
      <AIChatbot />
      <Router>
        <AuthSyncListener>
          <Routes>
            {/* Multi-Page Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/showcase" element={<ShowcasePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/pricing" element={<Navigate to="/" replace />} />
            <Route path="/faq" element={<FAQPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ForgotPassword />} />
            
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

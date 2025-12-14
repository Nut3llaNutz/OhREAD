import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import RecommendationPage from './pages/RecommendationPage';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

// Separate component to use useLocation context
const AppContent = () => {
  const { pathname } = useLocation();
  // We want to handle the footer manually (snap-scrolled) on: Landing (/), Auth (/login, /register), and Dashboard (/features)
  // Only generic pages like Recommendations (/recommend) might keep the global one for now, or we can just shift all to manual.
  // Let's hide it for the requested ones.
  const isCustomFooterPage = pathname === '/' || pathname === '/login' || pathname === '/register' || pathname === '/features';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/features" element={<Dashboard />} />
          <Route path="/recommend" element={<RecommendationPage />} />
        </Routes>
      </div>
      {!isCustomFooterPage && <Footer />}
    </div>
  );
};

export default App;

import { useState, useEffect } from 'react';
import './index.css';
import { getPrefs } from './utils/risk';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserAnalyzerPage from './pages/UserAnalyzerPage';
import DashboardPage from './pages/DashboardPage';
import RiskMonitorPage from './pages/RiskMonitorPage';
import BehavioralDriftPage from './pages/BehavioralDriftPage';
import ModelInsightsPage from './pages/ModelInsightsPage';
import StressSimulatorPage from './pages/StressSimulatorPage';
import SettingsPage from './pages/SettingsPage';
import MethodologyPage from './pages/MethodologyPage';

const PAGES = {
  'analyzer': UserAnalyzerPage,
  'dashboard': DashboardPage,
  'risk-monitor': RiskMonitorPage,
  'behavioral-drift': BehavioralDriftPage,
  'model-insights': ModelInsightsPage,
  'stress-simulator': StressSimulatorPage,
  'methodology': MethodologyPage,
  'settings': SettingsPage,
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [active, setActive] = useState('analyzer');
  const [compact, setCompact] = useState(() => getPrefs().compact);

  // Sync compact setting when prefs change
  useEffect(() => {
    const h = (e) => setCompact(e.detail?.compact ?? getPrefs().compact);
    window.addEventListener('bris-prefs-change', h);
    return () => window.removeEventListener('bris-prefs-change', h);
  }, []);

  // Check for existing session on load
  useEffect(() => {
    const session = localStorage.getItem('bris_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        setUser(parsed);
      } catch {
        localStorage.removeItem('bris_session');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setActive('analyzer');
  };

  const handleRegister = (userData) => {
    localStorage.setItem('bris_session', JSON.stringify({
      email: userData.email,
      name: userData.name,
      role: userData.role,
      loginTime: Date.now()
    }));
    setUser(userData);
    setActive('analyzer');
  };

  const handleLogout = () => {
    localStorage.removeItem('bris_session');
    setUser(null);
    setAuthView('login');
  };

  // Not logged in — show auth screen
  if (!user) {
    if (authView === 'register') {
      return <RegisterPage onGoLogin={() => setAuthView('login')} onRegister={handleRegister} />;
    }
    return <LoginPage onLogin={handleLogin} onGoRegister={() => setAuthView('register')} />;
  }

  const Page = PAGES[active] || UserAnalyzerPage;

  return (
    <div className={`shell${compact ? ' compact' : ''}`}>
      <Sidebar active={active} onNav={setActive} />
      <div className="main">
        <Navbar active={active} user={user} onLogout={handleLogout} />
        <main className="page">
          <Page user={user} onNavigate={setActive} />
        </main>
      </div>
    </div>
  );
}

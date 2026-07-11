import { useStore } from './store';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { EmailVault } from './pages/EmailVault';
import { Settings } from './pages/Settings';
import { Workspace } from './pages/Workspace';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './i18n';

export default function App() {
  const { token, language } = useStore();

  return (
    <div className={`app-container min-h-screen bg-dark-bg text-white ${language === 'ar' ? 'dir-rtl' : 'dir-ltr'}`}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
          <Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/vault" element={token ? <EmailVault /> : <Navigate to="/login" />} />
          <Route path="/settings" element={token ? <Settings /> : <Navigate to="/login" />} />
          <Route path="/workspace" element={token ? <Workspace /> : <Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Mail, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useStore } from '../../store';

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { setToken } = useStore();
  const location = useLocation();

  const navItems = [
    { path: '/', label: t('dashboard'), icon: <LayoutDashboard size={20} /> },
    { path: '/vault', label: t('emails'), icon: <Mail size={20} /> },
    { path: '/settings', label: t('settings', 'Settings'), icon: <SettingsIcon size={20} /> }
  ];

  return (
    <div className="flex min-h-screen bg-dark-bg">
      <aside className="w-64 glassmorphism border-r border-gray-800 p-6 flex flex-col">
        <div className="mb-12">
          <h1 className="text-2xl font-bold text-glow-cyan text-neon-cyan">Vault System</h1>
        </div>
        
        <nav className="flex-1 space-y-4">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${location.pathname === item.path ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan glow-cyan' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <button 
          onClick={() => setToken(null)}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-neon-pink hover:bg-neon-pink/10 transition-all mt-auto"
        >
          <LogOut size={20} />
          <span className="font-medium">{t('logout')}</span>
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

import { useState } from 'react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Globe as GlobeIcon } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { Globe } from '../components/3d/Globe';

export function Login() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { setToken, language, setLanguage } = useStore();
  const { t, i18n } = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterPassword: password })
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Connection failed');
    }
  };

  const toggleLang = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <div className={`min-h-screen relative flex items-center justify-center overflow-hidden ${language === 'ar' ? 'dir-rtl' : 'dir-ltr'}`}>
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Globe />
        </Canvas>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="glassmorphism p-8 rounded-2xl w-full max-w-md z-10 border border-neon-cyan glow-cyan"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-glow-cyan text-white">{t('login_title')}</h1>
          <button onClick={toggleLang} className="text-white hover:text-neon-cyan transition-colors">
            <GlobeIcon />
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('master_password')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-bg border border-gray-600 rounded-lg py-3 pl-10 pr-10 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {error && <p className="text-neon-pink mt-2 text-sm">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-transparent border-2 border-neon-cyan text-white font-bold py-3 px-4 rounded-lg hover:bg-neon-cyan hover:text-dark-bg transition-all duration-300 glow-cyan"
          >
            {t('enter')}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Layout } from '../components/layout/Layout';

export function Settings() {
  const { language, setLanguage } = useStore();
  const { t, i18n } = useTranslation();

  const toggleLang = (lang: 'en' | 'ar') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <Layout>
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-glow-cyan text-white">{t('settings', 'Settings')}</h1>
      </header>

      <div className="space-y-8 max-w-2xl text-white">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glassmorphism p-6 rounded-xl border border-gray-800"
        >
          <h3 className="text-xl font-bold mb-4">Language</h3>
          <div className="flex gap-4">
            <button 
              onClick={() => toggleLang('en')}
              className={`px-4 py-2 rounded-lg border ${language === 'en' ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan glow-cyan' : 'border-gray-700 text-gray-300 hover:border-neon-cyan/50'}`}
            >
              English
            </button>
            <button 
              onClick={() => toggleLang('ar')}
              className={`px-4 py-2 rounded-lg border ${language === 'ar' ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan glow-cyan' : 'border-gray-700 text-gray-300 hover:border-neon-cyan/50'}`}
            >
              العربية (Arabic)
            </button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}

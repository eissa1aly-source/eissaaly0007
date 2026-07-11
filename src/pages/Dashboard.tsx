import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Key, Server, Mail } from 'lucide-react';
import { Layout } from '../components/layout/Layout';

import { Link } from 'react-router-dom';

export function Dashboard() {
  const [emails, setEmails] = useState<any[]>([]);
  const { token, language } = useStore();
  const { t } = useTranslation();

  const fetchEmails = async () => {
    try {
      const res = await fetch('/api/vault/emails', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        useStore.getState().setToken(null);
        return;
      }
      if (res.ok) setEmails(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token) {
      fetchEmails();
    }
  }, [token]);

  const totalServices = emails.reduce((acc, email) => acc + email.services.length, 0);

  return (
    <Layout>
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold text-glow-cyan text-white">{t('dashboard')}</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <StatCard title={t('emails')} count={emails.length} icon={<Mail size={24} />} color="cyan" />
        <StatCard title={t('services')} count={totalServices} icon={<Server size={24} />} color="purple" />
        <StatCard title={t('credentials')} count={totalServices} icon={<Key size={24} />} color="pink" />
      </div>

      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">{t('emails')}</h2>
          <Link to="/vault" className="flex items-center gap-2 bg-transparent border border-neon-cyan text-neon-cyan px-4 py-2 rounded hover:bg-neon-cyan hover:text-dark-bg transition-all">
            <Plus size={20} />
            {t('add_email')}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {emails.map((email) => (
            <motion.div 
              key={email.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glassmorphism p-6 rounded-xl border border-gray-800 hover:border-neon-purple transition-all text-white"
            >
              <Link to="/vault" state={{ emailId: email.id }} className="inline-block hover:underline">
                <h3 className="text-xl font-bold text-neon-cyan mb-4 flex items-center gap-2"><Mail size={20}/> {email.address}</h3>
              </Link>
              <div className="space-y-4">
                {email.services.map((service: any) => (
                  <div key={service.id} className="bg-black/40 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-lg">{service.name}</h4>
                      <p className="text-sm text-gray-400">{service.category} • {service.status}</p>
                    </div>
                    <Link to="/vault" state={{ emailId: email.id }} className="text-neon-pink text-sm border border-neon-pink px-3 py-1 rounded hover:bg-neon-pink hover:text-white transition-all">
                      {t('show')} {t('credentials')}
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, count, icon, color }: any) {
  const colorMap: any = {
    cyan: 'border-neon-cyan text-neon-cyan glow-cyan',
    purple: 'border-neon-purple text-neon-purple glow-purple',
    pink: 'border-neon-pink text-neon-pink glow-pink',
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className={`glassmorphism p-6 rounded-xl border ${colorMap[color]} flex items-center justify-between`}
    >
      <div>
        <p className="text-gray-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{count}</p>
      </div>
      <div className="opacity-80">
        {icon}
      </div>
    </motion.div>
  );
}

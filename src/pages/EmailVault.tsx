import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { Plus, X, Mail } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const PRESET_CATEGORIES = {
  "LLMs & AI Models": [
    { name: "Groq", link: "https://console.groq.com/keys" },
    { name: "Google Gemini", link: "https://aistudio.google.com/app/apikey" },
    { name: "OpenRouter", link: "https://openrouter.ai/keys" },
    { name: "DeepSeek", link: "https://platform.deepseek.com/api_keys" },
    { name: "Anthropic (Claude)", link: "https://console.anthropic.com/settings/keys" },
    { name: "OpenAI (GPT)", link: "https://platform.openai.com/api-keys" },
    { name: "NVIDIA NIM", link: "https://build.nvidia.com/explore/discover" },
    { name: "Mistral AI", link: "https://console.mistral.ai/api-keys/" },
    { name: "Cohere", link: "https://dashboard.cohere.com/api-keys" },
    { name: "Hugging Face", link: "https://huggingface.co/settings/tokens" },
    { name: "OVHcloud AI", link: "https://endpoints.ai.cloud.ovh.net/" },
    { name: "Agnes AI", link: "https://agnes.ai/" },
    { name: "ModelScope", link: "https://modelscope.cn/my/api" },
    { name: "SambaNova", link: "https://sambanova.ai/" },
    { name: "Kilo Code", link: "https://kilocode.ai/" },
    { name: "Cloudflare Workers AI", link: "https://dash.cloudflare.com/profile/api-tokens" },
    { name: "Ollama Cloud", link: "https://ollama.com/" },
    { name: "Z AI (Zhipu AI)", link: "https://open.bigmodel.cn/" },
    { name: "GitHub Models", link: "https://github.com/settings/tokens" },
    { name: "Cerebras", link: "https://cloud.cerebras.ai/" },
    { name: "LLM7.io", link: "https://llm7.io/" },
    { name: "Aion Labs", link: "https://aionlabs.ai/" },
    { name: "OpenCode Zen", link: "https://opencode.zen/" },
    { name: "Glhf.chat", link: "https://glhf.chat/" },
    { name: "SiliconFlow", link: "https://siliconflow.cn/" },
    { name: "Chutes.ai", link: "https://chutes.ai/" },
    { name: "Grok (xAI)", link: "https://x.ai/api" },
    { name: "Alibaba Cloud", link: "https://dashscope.console.aliyun.com/" },
    { name: "Nebius", link: "https://nebius.ai/" },
    { name: "AI21 Labs", link: "https://studio.ai21.com/" },
    { name: "Nscale", link: "https://nscale.com/" }
  ],
  "Media AI (Image, Video, Audio)": [
    { name: "Replicate", link: "https://replicate.com/account/api-tokens" },
    { name: "ElevenLabs", link: "https://elevenlabs.io/app/settings/api-keys" },
    { name: "Runway ML", link: "https://app.runwayml.com/" },
    { name: "Leonardo AI", link: "https://app.leonardo.ai/" },
    { name: "Midjourney", link: "https://midjourney.com/" },
    { name: "Stability AI", link: "https://platform.stability.ai/" },
    { name: "ClipDrop", link: "https://clipdrop.co/" }
  ],
  "Databases & Cloud": [
    { name: "Supabase", link: "https://app.supabase.com/project/_/settings/api" },
    { name: "Firebase", link: "https://console.firebase.google.com/" },
    { name: "Neon (Postgres)", link: "https://console.neon.tech/" },
    { name: "MongoDB Atlas", link: "https://cloud.mongodb.com/" },
    { name: "Upstash Redis", link: "https://console.upstash.com/" },
    { name: "Turso (SQLite)", link: "https://turso.tech/" }
  ],
  "Tools & Automation": [
    { name: "n8n", link: "https://n8n.io/" },
    { name: "Facebook App", link: "https://developers.facebook.com/" },
    { name: "Google OAuth", link: "https://console.cloud.google.com/apis/credentials" }
  ]
};

export function EmailVault() {
  const [emails, setEmails] = useState<any[]>([]);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string | null>(location.state?.emailId || null);
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  
  const [isAddingService, setIsAddingService] = useState<string | null>(null);
  const defaultServiceState = { 
    name: '', 
    category: '', 
    status: 'Active', 
    link: '',
    credentials: { token: '', secretKey: '', apiKey: '', anonKey: '', serviceRoleKey: '', otherDetails: '' }
  };
  const [newService, setNewService] = useState(defaultServiceState);
  
  const [customFields, setCustomFields] = useState<{key: string, value: string}[]>([]);
  const [activePresetCategory, setActivePresetCategory] = useState<string>("LLMs & AI Models");
  
  const [activeCredential, setActiveCredential] = useState<any>(null);

  const { token } = useStore();
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
      if (res.ok) {
        const data = await res.json();
        setEmails(data);
        if (data.length > 0 && !activeTab) {
          setActiveTab(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token) {
      fetchEmails();
    }
  }, [token]);

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    
    try {
      const res = await fetch('/api/vault/emails', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ address: newEmail.trim() })
      });
      
      if (res.status === 401 || res.status === 403) {
        useStore.getState().setToken(null);
        return;
      }
      
      if (res.ok) {
        const email = await res.json();
        setEmails([...emails, { ...email, services: [] }]);
        setActiveTab(email.id);
        setNewEmail('');
        setIsAddingEmail(false);
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to add email' }));
        alert(err.error || 'Failed to add email');
      }
    } catch (error) {
      console.error('Failed to add email', error);
      alert('Failed to add email');
    }
  };

  const handleAddService = async (e: React.FormEvent, emailId: string) => {
    e.preventDefault();
    if (!newService.name.trim()) return;

    // Merge custom fields into credentials
    const finalCredentials = { ...newService.credentials };
    customFields.forEach(field => {
      if (field.key.trim() !== '') {
        (finalCredentials as any)[field.key.trim()] = field.value;
      }
    });

    try {
      const res = await fetch('/api/vault/services', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newService,
          credentials: finalCredentials,
          emailId
        })
      });
      
      if (res.status === 401 || res.status === 403) {
        useStore.getState().setToken(null);
        return;
      }

      if (res.ok) {
        const service = await res.json();
        setEmails(emails.map(email => 
          email.id === emailId 
            ? { ...email, services: [...email.services, service] } 
            : email
        ));
        setIsAddingService(null);
        setNewService(defaultServiceState);
        setCustomFields([]);
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to add service' }));
        alert(err.error || 'Failed to add service');
      }
    } catch (error) {
      console.error('Failed to add service', error);
    }
  };

  return (
    <Layout>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-glow-cyan text-white">{t('emails')}</h1>
        <button 
          onClick={() => setIsAddingEmail(true)}
          className="flex items-center gap-2 bg-transparent border border-neon-cyan text-neon-cyan px-4 py-2 rounded hover:bg-neon-cyan hover:text-dark-bg transition-all"
        >
          <Plus size={20} />
          {t('add_email')}
        </button>
      </header>

      <AnimatePresence>
        {isAddingEmail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <form onSubmit={handleAddEmail} className="glassmorphism p-6 rounded-xl border border-neon-cyan flex items-center gap-4">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@example.com"
                className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan transition-all"
                autoFocus
                required
              />
              <button 
                type="submit"
                className="bg-neon-cyan text-dark-bg px-6 py-2 rounded-lg font-bold hover:bg-white transition-colors"
              >
                Add
              </button>
              <button 
                type="button"
                onClick={() => setIsAddingEmail(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {emails.length === 0 && !isAddingEmail ? (
        <div className="text-gray-400 text-center py-12 glassmorphism rounded-xl border border-gray-800">
          No emails configured yet. Click "Add Email" to get started.
        </div>
      ) : emails.length > 0 ? (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Tabs Navigation */}
          <div className="w-full md:w-64 space-y-2 flex-shrink-0">
            {emails.map((email) => (
              <button
                key={email.id}
                onClick={() => setActiveTab(email.id)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                  activeTab === email.id
                    ? 'bg-neon-cyan/20 border border-neon-cyan text-neon-cyan glow-cyan'
                    : 'bg-black/20 border border-gray-800 text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Mail size={18} />
                <span className="truncate">{email.address}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {emails.map((email) => (
                email.id === activeTab && (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="glassmorphism p-6 rounded-xl border border-gray-800 text-white"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-neon-cyan">{email.address}</h3>
                      <button 
                        onClick={() => setIsAddingService(email.id)}
                        className="text-sm bg-black/50 border border-gray-600 px-3 py-1 rounded hover:border-white transition-all"
                      >
                        + Add Service
                      </button>
                    </div>

                    <AnimatePresence>
                      {isAddingService === email.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-6 overflow-hidden"
                        >
                          <div className="bg-black/30 p-4 rounded-lg border border-neon-cyan/50 space-y-4">
                            <div className="flex space-x-2 border-b border-gray-800 pb-2 mb-4 overflow-x-auto">
                              {Object.keys(PRESET_CATEGORIES).map((cat) => (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => setActivePresetCategory(cat)}
                                  className={`text-sm px-3 py-1 whitespace-nowrap rounded-t-lg transition-colors ${activePresetCategory === cat ? 'bg-black/50 text-neon-cyan border-t border-l border-r border-gray-700' : 'text-gray-400 hover:text-white'}`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-2 mb-6 max-h-48 overflow-y-auto p-2 bg-black/20 rounded border border-gray-800/50">
                              {(PRESET_CATEGORIES as any)[activePresetCategory].map((preset: any) => (
                                <button
                                  key={preset.name}
                                  type="button"
                                  onClick={() => setNewService({ ...newService, name: preset.name, category: activePresetCategory, link: preset.link })}
                                  className="text-xs bg-black/50 border border-gray-600 px-3 py-1.5 rounded hover:border-neon-cyan hover:text-neon-cyan transition-all text-left"
                                >
                                  {preset.name}
                                </button>
                              ))}
                            </div>
                            <form onSubmit={(e) => handleAddService(e, email.id)} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input
                                type="text"
                                placeholder="Service Name (e.g. AWS)"
                                value={newService.name}
                                onChange={(e) => setNewService({...newService, name: e.target.value})}
                                className="bg-black/50 border border-gray-700 rounded p-2 text-white"
                                required
                              />
                              <input
                                type="text"
                                placeholder="Category"
                                value={newService.category}
                                onChange={(e) => setNewService({...newService, category: e.target.value})}
                                className="bg-black/50 border border-gray-700 rounded p-2 text-white"
                              />
                              <input
                                type="text"
                                placeholder="Link / URL"
                                value={newService.link}
                                onChange={(e) => setNewService({...newService, link: e.target.value})}
                                className="bg-black/50 border border-gray-700 rounded p-2 text-white md:col-span-2"
                              />
                              
                              {/* Credentials */}
                              <div className="md:col-span-2 pt-2 border-t border-gray-800">
                                <h4 className="text-sm font-semibold text-gray-400 mb-3">Credentials</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <input
                                    type="text"
                                    placeholder="API Key"
                                    value={newService.credentials.apiKey}
                                    onChange={(e) => setNewService({...newService, credentials: {...newService.credentials, apiKey: e.target.value}})}
                                    className="bg-black/50 border border-gray-700 rounded p-2 text-white"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Secret Key"
                                    value={newService.credentials.secretKey}
                                    onChange={(e) => setNewService({...newService, credentials: {...newService.credentials, secretKey: e.target.value}})}
                                    className="bg-black/50 border border-gray-700 rounded p-2 text-white"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Token"
                                    value={newService.credentials.token}
                                    onChange={(e) => setNewService({...newService, credentials: {...newService.credentials, token: e.target.value}})}
                                    className="bg-black/50 border border-gray-700 rounded p-2 text-white"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Anon Key"
                                    value={newService.credentials.anonKey}
                                    onChange={(e) => setNewService({...newService, credentials: {...newService.credentials, anonKey: e.target.value}})}
                                    className="bg-black/50 border border-gray-700 rounded p-2 text-white"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Service Role Key"
                                    value={newService.credentials.serviceRoleKey}
                                    onChange={(e) => setNewService({...newService, credentials: {...newService.credentials, serviceRoleKey: e.target.value}})}
                                    className="bg-black/50 border border-gray-700 rounded p-2 text-white"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Other Details"
                                    value={newService.credentials.otherDetails}
                                    onChange={(e) => setNewService({...newService, credentials: {...newService.credentials, otherDetails: e.target.value}})}
                                    className="bg-black/50 border border-gray-700 rounded p-2 text-white"
                                  />
                                </div>
                              </div>
                              
                              {/* Custom Fields */}
                              <div className="md:col-span-2 pt-2 border-t border-gray-800">
                                <div className="flex justify-between items-center mb-3">
                                  <h4 className="text-sm font-semibold text-gray-400">Custom Fields</h4>
                                  <button 
                                    type="button"
                                    onClick={() => setCustomFields([...customFields, { key: '', value: '' }])}
                                    className="text-xs bg-black/50 border border-gray-600 px-2 py-1 rounded hover:border-white transition-all flex items-center gap-1"
                                  >
                                    <Plus size={14} /> Add Field
                                  </button>
                                </div>
                                <div className="space-y-3">
                                  {customFields.map((field, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                      <input
                                        type="text"
                                        placeholder="Field Name (e.g. Database Name)"
                                        value={field.key}
                                        onChange={(e) => {
                                          const newFields = [...customFields];
                                          newFields[idx].key = e.target.value;
                                          setCustomFields(newFields);
                                        }}
                                        className="bg-black/50 border border-gray-700 rounded p-2 text-white flex-1"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Value"
                                        value={field.value}
                                        onChange={(e) => {
                                          const newFields = [...customFields];
                                          newFields[idx].value = e.target.value;
                                          setCustomFields(newFields);
                                        }}
                                        className="bg-black/50 border border-gray-700 rounded p-2 text-white flex-1"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newFields = customFields.filter((_, i) => i !== idx);
                                          setCustomFields(newFields);
                                        }}
                                        className="text-gray-400 hover:text-red-400 p-2"
                                      >
                                        <X size={18} />
                                      </button>
                                    </div>
                                  ))}
                                  {customFields.length === 0 && (
                                    <p className="text-xs text-gray-500 italic">No custom fields added.</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                              <button 
                                type="button" 
                                onClick={() => {
                                  setIsAddingService(null);
                                  setCustomFields([]);
                                  setNewService(defaultServiceState);
                                }}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit"
                                className="bg-neon-cyan text-dark-bg px-4 py-2 rounded font-bold hover:bg-white transition-colors"
                              >
                                Save Service
                              </button>
                            </div>
                          </form>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {email.services && email.services.length > 0 ? (
                      <div className="space-y-4">
                        {email.services.map((service: any) => (
                          <div key={service.id} className="bg-black/40 p-4 rounded-lg flex justify-between items-center border border-gray-800 hover:border-neon-purple transition-all">
                            <div>
                              <h4 className="font-bold text-lg flex items-center gap-2">
                                {service.name}
                                {service.link && (
                                  <a href={service.link.startsWith('http') ? service.link : `https://${service.link}`} target="_blank" rel="noreferrer" className="text-neon-cyan hover:underline text-sm font-normal">
                                    [Link]
                                  </a>
                                )}
                              </h4>
                              <p className="text-sm text-gray-400">{service.category} • {service.status}</p>
                            </div>
                            <button 
                              onClick={() => setActiveCredential(service)}
                              className="text-neon-pink text-sm border border-neon-pink px-3 py-1 rounded hover:bg-neon-pink hover:text-white transition-all"
                            >
                              {t('show')} {t('credentials')}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 py-8 text-center bg-black/20 rounded-lg border border-gray-800/50 flex flex-col items-center justify-center">
                        <p>No services attached to this email yet.</p>
                      </div>
                    )}
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
        </div>
      ) : null}

      <AnimatePresence>
        {activeCredential && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-dark-bg border border-gray-700 p-6 rounded-xl w-full max-w-lg"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-neon-pink">{activeCredential.name} Credentials</h3>
                <button onClick={() => setActiveCredential(null)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-black/50 p-4 rounded-lg border border-gray-800 font-mono text-sm">
                  {activeCredential.credentials ? (
                    <pre className="text-gray-300 overflow-x-auto">
                      {JSON.stringify(activeCredential.credentials, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-gray-500 italic">No credentials stored.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

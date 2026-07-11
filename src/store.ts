import { create } from 'zustand';

interface VaultState {
  token: string | null;
  setToken: (token: string | null) => void;
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
}

export const useStore = create<VaultState>((set) => ({
  token: localStorage.getItem('vault_token'),
  setToken: (token) => {
    if (token) localStorage.setItem('vault_token', token);
    else localStorage.removeItem('vault_token');
    set({ token });
  },
  language: (localStorage.getItem('vault_lang') as 'en' | 'ar') || 'ar',
  setLanguage: (language) => {
    localStorage.setItem('vault_lang', language);
    set({ language });
  }
}));

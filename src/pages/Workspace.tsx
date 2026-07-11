import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { googleSignIn, initAuth, getAccessToken, logoutGoogle } from '../lib/firebase';
import { User } from 'firebase/auth';
import { Mail, FileText, Database, Trash2, LogOut } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function Workspace() {
  const [needsAuth, setNeedsAuth] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'drive' | 'sheets' | 'gmail'>('drive');

  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (u, t) => {
        setUser(u);
        setToken(t);
        setNeedsAuth(false);
      },
      () => setNeedsAuth(true)
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!needsAuth && token) {
      if (activeTab === 'drive') fetchDriveFiles();
      if (activeTab === 'gmail') fetchEmails();
    }
  }, [activeTab, needsAuth, token]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setNeedsAuth(true);
    setUser(null);
    setToken(null);
  };

  const fetchDriveFiles = async () => {
    setLoading(true);
    try {
      const t = await getAccessToken();
      const res = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name,mimeType)', {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      setDriveFiles(data.files || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const t = await getAccessToken();
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5', {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      
      if (data.messages) {
        const fullEmails = await Promise.all(
          data.messages.map(async (m: any) => {
            const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`, {
              headers: { Authorization: `Bearer ${t}` },
            });
            return msgRes.json();
          })
        );
        setEmails(fullEmails);
      } else {
        setEmails([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (id: string, name: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${name}" from your Google Drive? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const t = await getAccessToken();
      await fetch(`https://www.googleapis.com/drive/v3/files/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${t}` },
      });
      fetchDriveFiles();
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  if (needsAuth) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <h2 className="text-3xl font-bold mb-6 text-neon-cyan">Connect Google Workspace</h2>
          <p className="text-gray-400 mb-8 max-w-md text-center">
            Sign in with your Google account to access your Drive files, Sheets, and Gmail directly from your Vault.
          </p>
          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="gsi-material-button bg-white text-black px-4 py-2 rounded shadow flex items-center gap-3 font-medium hover:bg-gray-100 transition-colors"
          >
            {isLoggingIn ? <LoadingSpinner size={20} className="text-black" /> : (
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            )}
            Sign in with Google
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Google Workspace</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Signed in as <span className="text-white">{user?.email}</span></span>
            <button onClick={handleLogout} className="text-neon-pink hover:text-white transition-colors p-2 bg-neon-pink/10 rounded">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <div className="flex space-x-1 bg-black/40 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('drive')}
            className={`px-6 py-2 flex items-center gap-2 rounded-md transition-all ${activeTab === 'drive' ? 'bg-neon-cyan text-black font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            <Database size={18} /> Drive
          </button>
          <button
            onClick={() => setActiveTab('sheets')}
            className={`px-6 py-2 flex items-center gap-2 rounded-md transition-all ${activeTab === 'sheets' ? 'bg-neon-cyan text-black font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            <FileText size={18} /> Sheets
          </button>
          <button
            onClick={() => setActiveTab('gmail')}
            className={`px-6 py-2 flex items-center gap-2 rounded-md transition-all ${activeTab === 'gmail' ? 'bg-neon-cyan text-black font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            <Mail size={18} /> Gmail
          </button>
        </div>

        <div className="glassmorphism p-6 rounded-xl border border-gray-800 min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-full pt-20">
              <LoadingSpinner size={40} />
            </div>
          ) : (
            <>
              {activeTab === 'drive' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-neon-cyan">Recent Files</h2>
                  {driveFiles.length === 0 ? (
                    <p className="text-gray-400">No files found.</p>
                  ) : (
                    <div className="space-y-3">
                      {driveFiles.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-4 bg-black/40 rounded border border-gray-700 hover:border-neon-cyan/50 transition-colors">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileText className="text-gray-400 flex-shrink-0" size={20} />
                            <span className="truncate">{file.name}</span>
                          </div>
                          <button 
                            onClick={() => handleDeleteFile(file.id, file.name)}
                            className="text-gray-500 hover:text-neon-pink p-2 transition-colors"
                            title="Delete File"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'sheets' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-neon-cyan">Create Spreadsheet</h2>
                  <p className="text-gray-400 mb-4">Quickly create a new spreadsheet for vault tracking.</p>
                  <button 
                    onClick={async () => {
                      try {
                        setLoading(true);
                        const t = await getAccessToken();
                        const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
                          method: 'POST',
                          headers: { 
                            Authorization: `Bearer ${t}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            properties: { title: 'New Vault Sheet' }
                          })
                        });
                        const data = await res.json();
                        alert(`Sheet created! Spreadsheet ID: ${data.spreadsheetId}`);
                      } catch(e) {
                        console.error(e);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="bg-neon-cyan text-black px-4 py-2 rounded font-bold hover:bg-white transition-colors"
                  >
                    Create New Sheet
                  </button>
                </div>
              )}

              {activeTab === 'gmail' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-neon-cyan">Recent Emails</h2>
                  {emails.length === 0 ? (
                    <p className="text-gray-400">No recent emails.</p>
                  ) : (
                    <div className="space-y-4">
                      {emails.map((email: any) => {
                        const headers = email.payload?.headers || [];
                        const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
                        const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown';
                        return (
                          <div key={email.id} className="p-4 bg-black/40 rounded border border-gray-700 hover:border-neon-cyan/50 transition-colors">
                            <h3 className="font-semibold text-white mb-1 truncate">{subject}</h3>
                            <p className="text-sm text-gray-400 truncate">From: {from}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

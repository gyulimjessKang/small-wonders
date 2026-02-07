import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { apiFetch } from '../lib/api';

interface UserSettings {
  userId: string;
  preferredName: string;
}

export default function SettingsPage() {
  const defaultSettings: UserSettings = {
    userId: auth.currentUser?.uid || '',
    preferredName: ''
  };

  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [preferredNameInput, setPreferredNameInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` } as any;
      const data = await apiFetch('/api/settings', { headers }).then((r) => r.json());
      setSettings({...defaultSettings, ...data});
      setLoading(false);
    }
    load();
  }, []);

  const handleSaveInternal = async(updatedSettings: UserSettings, showMessage=true) => {
    setSaving(true);
    const headers = {Authorization:`Bearer ${localStorage.getItem('token')}`,
                    'Content-Type':'application/json'
                    } as any;
    try {
      await apiFetch('/api/settings',{method:'PUT', headers, body: JSON.stringify(updatedSettings)});
      if (showMessage){
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    await handleSaveInternal({...settings, preferredName: preferredNameInput});
  };

  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6 text-white">
      <h2 className="text-2xl font-semibold">Settings</h2>
      {/* Message display */}
      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      {/* Loading indicator */}
      {saving && (
        <div className="mt-6 text-center">
          <div className="text-gray-600">Saving settings...</div>
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="block mb-1">Preferred name</label>
          <input
            value={preferredNameInput}
            onChange={(e)=>setPreferredNameInput(e.target.value)}
            className="w-full px-3 py-2 rounded bg-white/10"
          />
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-purple-600 rounded hover:bg-purple-700"
        >
          Save
        </button>
      </div>
    </div>
  );
} 
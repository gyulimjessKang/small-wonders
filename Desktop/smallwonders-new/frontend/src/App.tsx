import { Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LogWonderPage from './pages/LogWonderPage';
import InsightsPage from './pages/InsightsPage';
import Navbar from './components/Navbar';
import { useEffect, useState } from 'react';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import ConfirmationPage from './pages/ConfirmationPage';
import SettingsPage from './pages/SettingsPage';
import StarfieldCanvas from './components/StarfieldCanvas';

export default function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (user) {
      (user as any).getIdToken().then((t: string) => localStorage.setItem('token', t));
    } else {
      localStorage.removeItem('token');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <button
          onClick={() => signInWithPopup(auth, googleProvider)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-800 to-indigo-900 text-white">
      <Navbar user={user} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/log" element={<LogWonderPage />} />
        <Route path="/log/confirmation" element={<ConfirmationPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
} 
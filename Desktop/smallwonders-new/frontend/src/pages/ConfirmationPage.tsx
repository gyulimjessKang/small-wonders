import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { apiFetch } from '../lib/api';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const [preferredName,setPreferredName]=useState<string>('');

  useEffect(()=>{
    async function load(){
      const res=await apiFetch('/api/settings');
      if(res.ok){
        const data=await res.json();
        if(data.preferredName) setPreferredName(data.preferredName);
      }
    }
    load();
  },[]);

  const name = preferredName || auth.currentUser?.displayName || 'Friend';
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] text-center px-4 bg-gradient-to-b from-violet-800 to-indigo-900 text-white">
      <h2 className="text-4xl sm:text-5xl font-bold mb-6">Congratulations, {name}!</h2>
      <p className="text-xl mb-8">Your Wonder has been logged :)</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-purple-600 rounded shadow hover:bg-purple-700"
      >
        Return Home
      </button>
    </div>
  );
} 
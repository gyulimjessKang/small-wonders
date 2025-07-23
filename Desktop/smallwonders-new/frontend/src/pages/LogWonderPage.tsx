import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { Prompt } from '../data/prompts';
import PromptSelector from '../components/PromptSelector';

export default function LogWonderPage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [text, setText] = useState('');
  const [isFreeWrite, setIsFreeWrite] = useState(false);
  // no refresh limit now

  // prompt provided by PromptSelector

  const count = text.length;

  async function handleSubmit() {
    if (!text.trim()) return;
    const body: any = { text };
    if (!isFreeWrite && prompt) {
      body.category = prompt.category;
      body.usedPromptId = prompt.id;
    } else {
      body.category = null;
    }
    await apiFetch('/api/wonders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(body)
    });
    navigate('/log/confirmation');
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-center">Let’s explore today’s small wonders :)</h2>

      <PromptSelector
        onPromptSelect={setPrompt}
        isFreeWrite={isFreeWrite}
        onFreeWriteToggle={setIsFreeWrite}
      />

      {isFreeWrite && (
        <div className="bg-white/10 p-4 rounded flex items-center justify-between">
          <span className="opacity-70">Free Write mode</span>
          <button onClick={() => setIsFreeWrite(false)} className="underline text-sm">
            Show Prompt
          </button>
        </div>
      )}

      <textarea
        className="w-full h-40 p-3 rounded bg-black/20 focus:outline-none"
        placeholder={isFreeWrite ? 'Write anything that caught your attention today…' : 'Share your wonder here...'}
        maxLength={500}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex justify-between text-sm opacity-80">
        <span>{count}/500</span>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-purple-600 rounded disabled:opacity-50"
          disabled={!text.trim()}
        >
          Release Wonder
        </button>
      </div>
    </div>
  );
} 
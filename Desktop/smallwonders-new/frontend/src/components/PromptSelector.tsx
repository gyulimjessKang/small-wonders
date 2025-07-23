import React, { useState, useEffect } from 'react';
import { prompts, Prompt, categories } from '../data/prompts';
import { useWonderHistory } from '../hooks/useWonderHistory';

interface PromptSelectorProps {
  onPromptSelect: (prompt: Prompt | null) => void;
  isFreeWrite: boolean;
  onFreeWriteToggle: (isFree: boolean) => void;
}

const PromptSelector: React.FC<PromptSelectorProps> = ({ onPromptSelect, isFreeWrite, onFreeWriteToggle }) => {
  const { categoryDistribution, loading, getUnderrepresentedCategories, getMostFrequentCategories } = useWonderHistory();
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);

  const selectPersonalizedPrompt = (): Prompt => {
    if (loading || Object.keys(categoryDistribution).length === 0) {
      return prompts[Math.floor(Math.random() * prompts.length)];
    }
    const under = getUnderrepresentedCategories();
    const most = getMostFrequentCategories(2);
    let targetCats: string[] = [];
    if (under.length) {
      targetCats = under;
    } else {
      const rest = categories.filter(c => !most.includes(c));
      targetCats = rest.length ? rest : categories;
    }
    const pool = prompts.filter(p => targetCats.includes(p.category));
    return pool[Math.floor(Math.random() * pool.length)];
  };

  useEffect(() => {
    if (!isFreeWrite) {
      const p = selectPersonalizedPrompt();
      setCurrentPrompt(p);
      onPromptSelect(p);
    } else {
      setCurrentPrompt(null);
      onPromptSelect(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryDistribution, loading, isFreeWrite]);

  const handleNewPrompt = () => {
    if (!isFreeWrite) {
      const p = selectPersonalizedPrompt();
      setCurrentPrompt(p);
      onPromptSelect(p);
    }
  };

  const toggleFreeWrite = () => {
    onFreeWriteToggle(!isFreeWrite);
  };

  if (loading) {
    return <div className="mb-6 p-4 text-center text-white/60">Loading personalized prompts…</div>;
  }

  return (
    <div className="mb-6">
      {/* Prompt display */}
      {!isFreeWrite && currentPrompt && (
        <div className="p-4 bg-white/10 rounded-lg border border-white/20 mb-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-purple-300 text-sm font-medium">{currentPrompt.category}</span>
            <button onClick={handleNewPrompt} className="px-3 py-1 rounded-md bg-purple-700 hover:bg-purple-600 text-sm text-white">New Prompt</button>
          </div>
          <p className="text-xl leading-relaxed text-white/90">{currentPrompt.text}</p>
          {currentPrompt.description && <p className="text-white/50 text-sm mt-2 italic">{currentPrompt.description}</p>}
        </div>
      )}

      {/* Free write toggle */}
      <div className="flex justify-center">
        <button onClick={toggleFreeWrite} className={`px-4 py-2 rounded-lg text-sm ${isFreeWrite ? 'bg-purple-500/30 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>
          {isFreeWrite ? 'Switch to Guided Prompt' : 'Free Write Mode'}
        </button>
      </div>

      {/* Indicator */}
      {isFreeWrite && (
        <div className="mt-4 p-3 bg-purple-500/20 rounded-lg border border-purple-400/30 text-center text-white/80 text-sm">
          ✨ Write anything that caught your attention today…
        </div>
      )}
    </div>
  );
};

export default PromptSelector; 
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] text-center px-4">
      <h1 className="text-4xl sm:text-5xl font-bold mb-4">Small Wonders</h1>
      <p className="max-w-xl mb-8 text-lg opacity-90">
        Capture the small moments that make life wonderful. Log your daily wonders and watch your constellation grow.
      </p>
      <div className="space-x-4">
        <button
          onClick={() => navigate('/log')}
          className="px-6 py-3 bg-purple-600 rounded shadow hover:bg-purple-700"
        >
          Log a Wonder
        </button>
        <button
          onClick={() => navigate('/insights')}
          className="px-6 py-3 bg-white/20 rounded shadow hover:bg-white/30"
        >
          My Insights
        </button>
      </div>
    </div>
  );
} 
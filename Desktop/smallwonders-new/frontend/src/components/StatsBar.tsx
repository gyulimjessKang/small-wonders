interface Props {
  total: number;
  streak: number;
  topCategory: string;
}

export default function StatsBar({ total, streak, topCategory }: Props) {
  const Item = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex flex-col items-center bg-white/10 rounded px-4 py-2">
      <span className="text-xs uppercase opacity-70 mb-1">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );

  return (
    <div className="flex flex-wrap justify-center gap-4">
      <Item label="Total Stars" value={total} />
      <Item label="Highest Streak" value={streak} />
      <Item label="Top Category" value={topCategory || '—'} />
    </div>
  );
} 
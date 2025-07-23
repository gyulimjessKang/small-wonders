interface Props {
  categories: string[];
  category: string;
  onCategoryChange: (c: string) => void;
  search: string;
  onSearchChange: (s: string) => void;
  onClear: ()=>void;
  visible:number;
  total:number;
}

export default function SearchFilterBar({
  categories,
  category,
  onCategoryChange,
  search,
  onSearchChange,
  onClear,
  visible,
  total
}: Props) {
  const active = category || search;
  return (
    <div className="flex flex-col items-center mb-6 space-y-2">
      <div className="flex flex-wrap gap-4 items-center justify-center">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-2 rounded bg-white/10"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Type to search wonder text..."
          className="px-3 py-2 rounded bg-white/10 w-64"
        />
        {active && (
          <button onClick={onClear} className="underline text-sm">
            Clear Filters
          </button>
        )}
      </div>
      {active && (
        <p className="text-sm text-white/70">
          Showing {visible} of {total} wonders
        </p>
      )}
    </div>
  );
} 
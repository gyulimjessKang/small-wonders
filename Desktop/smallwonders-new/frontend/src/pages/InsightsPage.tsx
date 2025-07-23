import { useMemo, useState, useEffect, useRef } from 'react';
import StatsBar from '../components/StatsBar';
import SearchFilterBar from '../components/SearchFilterBar';
import Constellation3D,{GraphNode,GraphLink} from '../components/Constellation3D';
import WonderPopup from '../components/WonderPopup';
import { apiFetch } from '../lib/api';
import { getAllCategories } from '../data/prompts';

interface Wonder {
  id: string;
  text: string;
  category: string;
  createdAt: string;
}

export default function InsightsPage() {
  const [wonders, setWonders] = useState<Wonder[]>([]);
  const [stats, setStats] = useState({ total: 0, streak: 0, topCategory: '' });
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [selected,setSelected]=useState<Wonder|null>(null);
  const [hovered,setHovered]=useState<Wonder|null>(null);

  useEffect(() => {
    let canceled = false;
    async function load() {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` } as any;
      const wRes = await apiFetch('/api/wonders', { headers });
      if (!wRes.ok) return; // auth error, ignore until token refresh
      const sRes = await apiFetch('/api/stats', { headers });
      if (canceled) return;
      const wondersData = await wRes.json();
      const statsData = sRes.ok ? await sRes.json() : { total: 0, streak: 0, topCategory: '' };
      setWonders(Array.isArray(wondersData) ? wondersData : []);
      setStats(statsData);
    }
    load();
    return () => {
      canceled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return wonders.filter((w) => {
      const matchesCategory = category ? w.category === category : true;
      const matchesSearch = w.text.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [wonders, category, search]);

  const allCategories = useMemo(
    () => [...getAllCategories(), 'Other'],
    []
  );

  // build nodes & links for graph
  const nodes:GraphNode[]=useMemo(()=>filtered.map(w=>({id:w.id,name:w.text,date:w.createdAt.slice(0,10),category:w.category})),[filtered]);
  const links:GraphLink[]=useMemo(()=>{
    const byDay:Record<string,string[]>={};
    filtered.forEach(w=>{
      const d=w.createdAt.slice(0,10);
      (byDay[d]=byDay[d]||[]).push(w.id);
    });
    const res:GraphLink[]=[];
    Object.values(byDay).forEach(ids=>{
      for(let i=0;i<ids.length-1;i++) res.push({source:ids[i],target:ids[i+1]});
    });
    return res;
  },[filtered]);

  const clearFilters=()=>{setCategory('');setSearch('');};

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <StatsBar total={stats.total} streak={stats.streak} topCategory={stats.topCategory} />
      <SearchFilterBar
        categories={allCategories}
        category={category}
        onCategoryChange={setCategory}
        search={search}
        onSearchChange={setSearch}
        onClear={clearFilters}
        visible={filtered.length}
        total={wonders.length}
      />
      {hovered && (
        <div className="absolute left-2 top-20 bg-black/80 text-white text-sm p-2 rounded max-w-xs pointer-events-none">
          <p className="font-semibold mb-1">{new Date(hovered.createdAt).toLocaleDateString()}</p>
          {hovered.text.slice(0,60)}{hovered.text.length>60?'…':''}
        </div>
      )}
      {wonders.length>=5 && (
        nodes.length>0 ? (
          <Constellation3D
            nodes={nodes}
            links={links}
            onSelect={(n)=>{const w=wonders.find(w=>w.id===n.id);if(w) setSelected(w);}}
            onHover={(n)=>{const w=wonders.find(w=>w.id===n?.id);setHovered(w||null);}}
          />
        ) : (
          <div className="text-center text-white/70">No wonders match current filters.</div>
        )
      )}
      {wonders.length<5 && (
        <div className="text-center text-white">Log 5 wonders to unlock your constellation!</div>
      )}
      {selected && <WonderPopup wonder={selected} onClose={()=>setSelected(null)} />}
    </div>
  );
} 
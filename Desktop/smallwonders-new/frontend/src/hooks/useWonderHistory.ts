import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { categories } from '../data/prompts';

export interface CategoryDistribution { [cat: string]: number }

export function useWonderHistory() {
  const [distribution, setDistribution]=useState<CategoryDistribution>({});
  const [loading, setLoading]=useState(true);

  useEffect(()=>{
    const fetchData=async()=>{
      const res=await apiFetch('/api/wonders');
      if(!res.ok){setLoading(false);return;}
      const wonders: {category?:string}[]=await res.json();
      const dist:CategoryDistribution={};
      wonders.forEach(w=>{
        const cat=w.category||'Other';
        dist[cat]=(dist[cat]||0)+1;
      });
      setDistribution(dist);
      setLoading(false);
    };
    fetchData();
  },[]);

  const total=Object.values(distribution).reduce((a,b)=>a+b,0);
  const expected=Math.max(1,Math.floor(total/categories.length));
  const getUnderrepresentedCategories=():string[]=>{
    return categories.filter(c=>(distribution[c]||0)<expected*0.5);
  };
  const getMostFrequentCategories=(limit=3):string[]=>{
    return Object.entries(distribution).sort((a,b)=>b[1]-a[1]).slice(0,limit).map(([c])=>c);
  };

  return {categoryDistribution:distribution,loading,getUnderrepresentedCategories,getMostFrequentCategories};
} 
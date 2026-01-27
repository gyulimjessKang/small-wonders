import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d';

export interface GraphNode {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  category?: string;
}
export interface GraphLink {
  source: string;
  target: string;
}
interface Props {
  nodes: GraphNode[];
  links: GraphLink[];
  onSelect: (n: GraphNode) => void;
  onHover?: (n: GraphNode|null)=>void;
}

const pastelColors = ['#ffd1dc','#ffecd1','#d1e8ff','#e0d1ff','#d1ffd6','#fff5d1'];
function colorByDate(date: string) {
  const hash = Array.from(date).reduce((acc,c)=>acc+c.charCodeAt(0),0);
  return pastelColors[Math.abs(hash)%pastelColors.length];
}

// Creates twinkling background for wonders
export default function Constellation3D({ nodes, links, onSelect,onHover }: Props) {
  const ref = useRef<any>();
  const containerRef=useRef<HTMLDivElement>(null);
  const canvasRef=useRef<HTMLCanvasElement>(null);

  // track container dimensions
  const [dim,setDim]=useState({width:0,height:0});
  useLayoutEffect(()=>{
    const el=containerRef.current;
    if(!el) return;
    const obs=new ResizeObserver(([entry])=>{
      const {width,height}=entry.contentRect;
      setDim({width,height});
    });
    obs.observe(el);
    return()=>obs.disconnect();
  },[]);

  // animated stars + planets
  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas||!dim.width||!dim.height) return;
    const ctx=canvas.getContext('2d');
    if(!ctx) return;
    canvas.width=dim.width;
    canvas.height=dim.height;

    const stars: {x:number;y:number;size:number;opacity:number;speed:number}[]=[];
    for(let i=0;i<200;i++){
      stars.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,size:Math.random()*2+1,opacity:Math.random()*0.8+0.2,speed:Math.random()*0.02+0.01});
    }
    const planetColors=['#ff6b6b','#4ecdc4','#45b7d1','#96ceb4','#feca57'];
    const planets:{x:number;y:number;size:number;color:string;orbitRadius:number;orbitSpeed:number;angle:number}[]=[];
    for(let i=0;i<5;i++){
      planets.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,size:Math.random()*20+10,color:planetColors[i%planetColors.length],orbitRadius:Math.random()*50+30,orbitSpeed:Math.random()*0.01+0.005,angle:Math.random()*Math.PI*2});
    }

    let anim:number;
    const animate=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);
      // stars
      stars.forEach(s=>{
        s.opacity+=Math.sin(Date.now()*s.speed)*0.1;
        s.opacity=Math.max(0.1,Math.min(1,s.opacity));
        ctx.beginPath();
        ctx.arc(s.x,s.y,s.size,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,255,255,${s.opacity})`;
        ctx.fill();
      });
      // planets
      planets.forEach(p=>{
        p.angle+=p.orbitSpeed;
        const x=p.x+Math.cos(p.angle)*p.orbitRadius;
        const y=p.y+Math.sin(p.angle)*p.orbitRadius;
        ctx.beginPath();
        ctx.arc(x,y,p.size,0,Math.PI*2);
        ctx.fillStyle=p.color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x,y,p.size+5,0,Math.PI*2);
        ctx.fillStyle=`${p.color}40`;
        ctx.fill();
      });
      anim=requestAnimationFrame(animate);
    };
    anim=requestAnimationFrame(animate);
    return()=>cancelAnimationFrame(anim);
  },[dim]);

  useEffect(()=>{
    const t=setTimeout(()=>ref.current?.zoomToFit(400,60),300);
    return ()=>clearTimeout(t);
  },[]);

  // fade-in wrapper style
  return (
    <div ref={containerRef} style={{position:'relative',width:'100%',height:'500px'}} className="animate-fade-in">
      {/* starfield layer */}
      <canvas ref={canvasRef} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',zIndex:0,background:'radial-gradient(ellipse at center, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'}} />

      {/* graph layer */}
      <div style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',zIndex:1}}>
        <ForceGraph3D
          ref={ref}
          width={dim.width}
          height={dim.height}
          graphData={{ nodes, links }}
          nodeRelSize={8}
          nodeColor={(n:any)=>colorByDate(n.date)}
          nodeLabel={(n:any)=>n.name}
          linkWidth={1}
          linkColor={()=>'#ffffff40'}
          enableNodeDrag={true}
          enableNavigationControls={true}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          cooldownTicks={100}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          backgroundColor="rgba(0,0,0,0)"
          onNodeClick={(n: any)=>onSelect(n)}
          onNodeHover={(n:any)=>onHover?.(n||null)}
        />
      </div>
    </div>
  );
} 
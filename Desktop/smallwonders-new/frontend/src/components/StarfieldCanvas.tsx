import React from 'react';
import { useEffect, useRef } from 'react';

export default function StarfieldCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(()=>{
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const stars = Array.from({length:150},()=>({x:Math.random()*width,y:Math.random()*height,size:Math.random()*2+0.5,opacity:Math.random()*0.6+0.2,speed:Math.random()*0.3+0.1}));
    const resize=()=>{width=canvas.width=window.innerWidth;height=canvas.height=window.innerHeight;};
    window.addEventListener('resize',resize);
    const loop=()=>{
      ctx.clearRect(0,0,width,height);
      stars.forEach(s=>{s.y+=s.speed;if(s.y>height)s.y=0;ctx.beginPath();ctx.arc(s.x,s.y,s.size,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${s.opacity})`;ctx.fill();});
      requestAnimationFrame(loop);
    };
    loop();
    return ()=>window.removeEventListener('resize',resize);
  },[]);
  return <canvas ref={ref} className="fixed inset-0 -z-10"/>;
} 
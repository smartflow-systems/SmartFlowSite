"use client"; import {useEffect,useState} from "react";
export default function Page(){
  const [json,setJson]=useState("(loading...)"),[n,setN]=useState(0);
  async function load(){const r=await fetch("/api/boost");const d=await r.json();setJson(JSON.stringify(d,null,2));setN(Array.isArray(d.boosts)?d.boosts.length:0);}
  useEffect(()=>{load().catch(()=>{});},[]);
  return(<main className="min-h-screen bg-[#0D0D0D] text-white p-6">
    <div className="max-w-2xl mx-auto space-y-3">
      <h1 className="text-2xl">SmartFlow Boosts <span className="text-[#FFD700]">({n})</span></h1>
      <div className="flex gap-2">
        <button onClick={load} className="px-3 py-2 rounded-2xl bg-[#3B2F2F]">Reload</button>
        <button onClick={()=>navigator.clipboard.writeText(json)} className="px-3 py-2 rounded-2xl bg-[#FFD700] text-black">Copy JSON</button>
      </div>
      <pre className="bg-black/60 p-3 rounded-2xl overflow-auto text-sm">{json}</pre>
      <p className="text-xs text-white/70">GET <code>/api/boost</code></p>
    </div></main>);
}

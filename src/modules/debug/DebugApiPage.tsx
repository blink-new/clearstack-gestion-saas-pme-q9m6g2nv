import { useEffect, useState } from "react";
import { API_URL } from "../../lib/api";
export default function DebugApiPage(){
  const [s,setS]=useState("Test en cours…"); const [ok,setOk]=useState<boolean|null>(null);
  useEffect(()=>{(async()=>{try{const r=await fetch(`${API_URL}/__health`); const ct=r.headers.get("content-type")||""; if(!ct.includes("application/json")){setOk(false); setS("Réponse non‑JSON (probable HTML)."); return;} const j=await r.json(); setOk(true); setS(`OK ${r.status} – ts ${j.ts}`);}catch(e:any){setOk(false); setS(e?.message||"Erreur réseau");}})();},[]);
  return <div className="p-6 space-y-2"><h1 className="text-xl font-semibold">Debug API</h1><div>API_URL: <code>{API_URL}</code></div><div className={`p-3 rounded-lg border ${ok?"bg-emerald-50 dark:bg-emerald-900/20":"bg-amber-50 dark:bg-amber-900/20"}`}>{ok===null?"…": ok?"✅ API OK":"❌ API KO"} — {s}</div></div>;
}
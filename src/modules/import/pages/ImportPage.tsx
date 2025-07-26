import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiFetch, toast } from "../../../lib/api";

type ImportBatch = { id:string; status:"DRAFT"|"IMPORTED"; mapping?:Record<string,string>|null; preview_data?:any[]|null; errors?:string[]|null };

export default function ImportPage(){
  const [step,setStep]=useState<1|2|3>(1);
  const [raw,setRaw]=useState("");
  const [batch,setBatch]=useState<ImportBatch|null>(null);
  const [mapping,setMapping]=useState<Record<string,string>>({});

  const createDraft = useMutation({
    mutationFn:(rows:any[])=> apiFetch<ImportBatch>("/imports",{ method:"POST", body: JSON.stringify({ data: rows }) }),
    onSuccess:(ib)=>{ setBatch(ib); setStep(2); toast("Brouillon d'import créé"); }
  });

  const saveMapping = useMutation({
    mutationFn:(m:Record<string,string>)=> apiFetch<ImportBatch>(`/imports/${batch!.id}`, { method:"PATCH", body: JSON.stringify({ mapping: m }) }),
    onSuccess:(ib)=>{ setBatch(ib); setStep(3); toast("Mapping enregistré"); }
  });

  const commit = useMutation({
    mutationFn:()=> apiFetch<{message:string;imported_count:number;errors_count:number}>(`/imports/${batch!.id}/commit`, { method:"POST" }),
    onSuccess:(r)=>{ toast(`${r.imported_count} lignes importées, ${r.errors_count} erreur(s)`); }
  });

  // Parse minimal CSV/TSV collé
  const parsed = useMemo(()=> {
    if(!raw.trim()) return [] as string[][];
    const sep = raw.includes("\t") ? "\t" : ",";
    return raw.trim().split(/\r?\n/).map(l=> l.split(sep).map(c=>c.trim()));
  },[raw]);
  const headers = parsed[0] || [];
  const rows = parsed.slice(1).map(cols => Object.fromEntries(headers.map((h,i)=>[h, cols[i] ?? ""])));

  const targetFields = [
    {key:"name", label:"Nom logiciel"},
    {key:"version", label:"Version"},
    {key:"cost_amount", label:"Coût mensuel (€)"},
    {key:"category", label:"Catégorie"},
  ];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Import de données</h1>

      {/* Étapes */}
      <div className="flex gap-2 text-sm">
        {[1,2,3].map(n=>(
          <div key={n} className={`px-3 py-1 rounded-full border ${step===n?"bg-primary/10 text-primary border-primary/30":""}`}>Étape {n}</div>
        ))}
      </div>

      {step===1 && (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">Collez un tableau (CSV/TSV) avec en-tête : <code>nom_logiciel, version, cout_mensuel, catégorie</code> (souple).</div>
          <textarea value={raw} onChange={e=>setRaw(e.target.value)} rows={12} className="w-full border rounded-xl p-3 font-mono" placeholder="nom_logiciel,version,cout_mensuel,catégorie&#10;Slack,4.29.0,15.99,Communication"/>
          <div className="flex justify-end">
            <button disabled={rows.length===0} onClick={()=>createDraft.mutate(rows)} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50">Créer le brouillon</button>
          </div>
        </div>
      )}

      {step===2 && batch && (
        <div className="space-y-4">
          <div className="text-sm">Associez les colonnes de votre fichier aux champs cibles.</div>
          <div className="grid md:grid-cols-2 gap-3">
            {targetFields.map(tf=>(
              <div key={tf.key} className="flex items-center gap-2">
                <div className="w-48 text-sm">{tf.label}</div>
                <select value={mapping[tf.key]||""} onChange={e=>setMapping(m=>({...m,[tf.key]: e.target.value}))} className="px-3 py-2 border rounded-lg flex-1">
                  <option value="">—</option>
                  {headers.map(h=><option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={()=>saveMapping.mutate(mapping)} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground">Enregistrer le mapping</button>
          </div>
        </div>
      )}

      {step===3 && batch && (
        <div className="space-y-3">
          <div className="text-sm">Aperçu des {rows.length} lignes (max 10 montrées) :</div>
          <div className="border rounded-xl overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr>{headers.slice(0,8).map(h=><th key={h} className="text-left p-2">{h}</th>)}</tr></thead>
              <tbody>
                {rows.slice(0,10).map((r,i)=>(<tr key={i} className="border-t">{headers.slice(0,8).map(h=><td key={h} className="p-2">{r[h]}</td>)}</tr>))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <button onClick={()=>commit.mutate()} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground">Finaliser l'import</button>
          </div>
        </div>
      )}
    </div>
  );
}
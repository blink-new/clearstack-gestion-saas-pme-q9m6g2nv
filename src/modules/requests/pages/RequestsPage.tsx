import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, Paginated, toast } from "../../../lib/api";

type RequestItem = {
  id:string; software_ref?:string|null; software_id?:string|null;
  description_need:string; urgency:"IMMEDIATE"|"<3M"|">3M"; est_budget?:number|null;
  status:"DRAFT"|"SUBMITTED"|"REVIEW"|"ACCEPTED"|"REFUSED";
  votes_count:number; user_has_voted?:boolean; created_at:string;
};

export default function RequestsPage(){
  const qc = useQueryClient();
  const [tab,setTab]=useState<"ALL"|"SUBMITTED"|"REVIEW"|"ACCEPTED"|"REFUSED">("ALL");
  const [urg,setUrg]=useState<string>("");
  const [search,setSearch]=useState("");
  const [showCreate,setShowCreate]=useState(false);

  const q = useQuery({
    queryKey:["requests",{tab,urg,search}],
    queryFn:()=> {
      const params = new URLSearchParams();
      if (tab!=="ALL") params.set("status", tab);
      if (urg) params.set("urgency", urg);
      if (search) params.set("search", search);
      return apiFetch<Paginated<RequestItem>>(`/requests?${params.toString()}`);
    }
  });

  const create = useMutation({
    mutationFn:(payload: Partial<RequestItem>)=> apiFetch<RequestItem>("/requests",{method:"POST", body:JSON.stringify({
      software_ref: payload.software_ref || undefined,
      description_need: payload.description_need,
      urgency: payload.urgency,
      est_budget: payload.est_budget
    })}),
    onSuccess:()=>{ toast("Demande créée"); setShowCreate(false); qc.invalidateQueries({queryKey:["requests"]}); }
  });

  const vote = useMutation({
    mutationFn:(id:string)=> apiFetch(`/requests/${id}/votes`, { method:"POST" }),
    onSuccess:()=>{ qc.invalidateQueries({queryKey:["requests"]}); }
  });
  const unvote = useMutation({
    mutationFn:(id:string)=> apiFetch(`/requests/${id}/votes`, { method:"DELETE" }),
    onSuccess:()=>{ qc.invalidateQueries({queryKey:["requests"]}); }
  });

  // Actions Admin : patch statut + créer projet d'achat
  const setStatus = useMutation({
    mutationFn:({id,status,admin_comment}:{id:string;status:"REVIEW"|"ACCEPTED"|"REFUSED";admin_comment?:string}) =>
      apiFetch(`/requests/${id}`, { method:"PATCH", body: JSON.stringify({ status, admin_comment }) }),
    onSuccess:()=>{ toast("Statut mis à jour"); qc.invalidateQueries({queryKey:["requests"]}); }
  });
  const createProject = useMutation({
    mutationFn:(id:string)=> apiFetch("/purchase-projects", { method:"POST", body: JSON.stringify({ request_id: id }) }),
    onSuccess:()=>{ toast("Projet d'achat créé"); qc.invalidateQueries({queryKey:["requests"]}); }
  });

  return (
    <div className="p-6 space-y-4">
      <header className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">Demandes de logiciel</h1>
        <div className="ml-auto flex gap-2">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Recherche…" className="px-3 py-2 border rounded-lg w-64"/>
          <select value={urg} onChange={e=>setUrg(e.target.value)} className="px-3 py-2 border rounded-lg">
            <option value="">Urgence (toutes)</option>
            <option value="IMMEDIATE">Immédiate</option>
            <option value="<3M">&lt; 3 mois</option>
            <option value=">3M">&gt; 3 mois</option>
          </select>
          <button onClick={()=>setShowCreate(true)} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground">Nouvelle demande</button>
        </div>
      </header>

      <div className="flex gap-2">
        {["ALL","SUBMITTED","REVIEW","ACCEPTED","REFUSED"].map(t=>(
          <button key={t} onClick={()=>setTab(t as any)}
            className={`px-3 py-2 rounded-lg border ${tab===t?"bg-primary/10 text-primary border-primary/30":"hover:bg-muted"}`}>
            {t==="ALL"?"Toutes":t}
          </button>
        ))}
      </div>

      {q.isLoading ? <div>Chargement…</div> : (
        <div className="grid gap-3">
          {q.data?.data.map(r=>(
            <div key={r.id} className="border rounded-xl p-4">
              <div className="flex gap-2 items-start">
                <div className="font-semibold">{r.software_ref || "Nouveau logiciel"}</div>
                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-muted">{r.status}</span>
                <span className="ml-auto text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString("fr-FR")}</span>
              </div>
              <p className="mt-2 text-sm">{r.description_need}</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xs px-2 py-1 rounded bg-muted">Urgence: {r.urgency}</span>
                {typeof r.est_budget === "number" && <span className="text-xs px-2 py-1 rounded bg-muted">Budget estimé: {r.est_budget} €</span>}
                <div className="ml-auto flex items-center gap-2">
                  <button disabled={r.user_has_voted} onClick={()=>vote.mutate(r.id)}
                          className="px-3 py-2 rounded-lg border hover:bg-muted disabled:opacity-50">+1 ({r.votes_count})</button>
                  {r.user_has_voted && (
                    <button onClick={()=>unvote.mutate(r.id)} className="px-3 py-2 rounded-lg border hover:bg-muted">Retirer</button>
                  )}
                  {/* Admin actions (le backend protège déjà, bouton visible partout pour MVP) */}
                  {r.status!=="ACCEPTED" && <button onClick={()=>setStatus.mutate({id:r.id, status:"ACCEPTED"})} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground">Accepter</button>}
                  {r.status!=="REFUSED" && <button onClick={()=>setStatus.mutate({id:r.id, status:"REFUSED"})} className="px-3 py-2 rounded-lg border">Refuser</button>}
                  {r.status==="ACCEPTED" && <button onClick={()=>createProject.mutate(r.id)} className="px-3 py-2 rounded-lg border">Créer projet d'achat</button>}
                </div>
              </div>
            </div>
          ))}
          {q.data && q.data.data.length===0 && <div className="text-center p-8 text-muted-foreground border rounded-xl">Aucune demande.</div>}
        </div>
      )}

      {/* Modale création */}
      {showCreate && (
        <div className="fixed inset-0 grid place-items-center bg-black/30">
          <div className="bg-background rounded-2xl p-5 w-[520px] shadow-xl">
            <h2 className="text-lg font-semibold mb-3">Nouvelle demande</h2>
            <form className="space-y-3" onSubmit={(e)=>{e.preventDefault();
              const fd=new FormData(e.currentTarget as HTMLFormElement);
              const payload = {
                software_ref: String(fd.get("software_ref")||""),
                description_need: String(fd.get("description_need")||""),
                urgency: String(fd.get("urgency")||"<3M"),
                est_budget: fd.get("est_budget") ? Number(fd.get("est_budget")): undefined
              };
              create.mutate(payload);
            }}>
              <input name="software_ref" placeholder="Nom du logiciel (ou idée) *" className="w-full px-3 py-2 border rounded-lg" required />
              <textarea name="description_need" placeholder="Description du besoin (max 280)" maxLength={280} className="w-full px-3 py-2 border rounded-lg" rows={3} required />
              <div className="grid grid-cols-2 gap-3">
                <select name="urgency" className="px-3 py-2 border rounded-lg">
                  <option value="IMMEDIATE">Immédiate</option>
                  <option value="<3M">&lt; 3 mois</option>
                  <option value=">3M">&gt; 3 mois</option>
                </select>
                <input name="est_budget" type="number" min="0" step="0.01" placeholder="Budget estimé (€)" className="px-3 py-2 border rounded-lg"/>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={()=>setShowCreate(false)} className="px-3 py-2 border rounded-lg">Annuler</button>
                <button className="px-3 py-2 rounded-lg bg-primary text-primary-foreground">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
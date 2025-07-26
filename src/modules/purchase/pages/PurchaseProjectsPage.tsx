import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, Paginated, toast } from "../../../lib/api";

type Task = { id:string; title:string; done:boolean; assignee_id?:string|null; due_date?:string|null };
type Project = {
  id:string; status:"STEP1"|"STEP2"|"STEP3"|"STEP4"|"DONE";
  roi_estimate?:string|null; risks?:string|null; created_at:string;
  request?: { software_ref?:string|null; description_need?:string };
  tasks?: Task[];
};

function next(status: Project["status"]): Project["status"] {
  const order: Project["status"][] = ["STEP1","STEP2","STEP3","STEP4","DONE"];
  const idx = order.indexOf(status);
  return order[Math.min(idx+1, order.length-1)];
}

export default function PurchaseProjectsPage(){
  const qc = useQueryClient();
  const q = useQuery({
    queryKey:["projects"],
    queryFn:()=> apiFetch<Paginated<Project>>("/purchase-projects?limit=50")
  });

  const updateStatus = useMutation({
    mutationFn:(p: {id:string; status: Project["status"]})=> apiFetch(`/purchase-projects/${p.id}`, { method:"PATCH", body: JSON.stringify({ status: p.status }) }),
    onSuccess:()=>{ toast("Statut mis à jour"); qc.invalidateQueries({queryKey:["projects"]}); }
  });
  const addTask = useMutation({
    mutationFn:(p:{project_id:string; title:string})=> apiFetch(`/purchase-projects/${p.project_id}/tasks`, { method:"POST", body: JSON.stringify({ title: p.title }) }),
    onSuccess:()=>{ qc.invalidateQueries({queryKey:["projects"]}); }
  });
  const toggleTask = useMutation({
    mutationFn:(p:{id:string; done:boolean})=> apiFetch(`/tasks/${p.id}`, { method:"PATCH", body: JSON.stringify({ done: p.done }) }),
    onSuccess:()=>{ qc.invalidateQueries({queryKey:["projects"]}); }
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Projets d'achat</h1>
      {q.isLoading ? <div>Chargement…</div> : (
        <div className="grid gap-3">
          {q.data?.data.map(pr=>(
            <div key={pr.id} className="border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="font-semibold">{pr.request?.software_ref || "Nouveau logiciel"}</div>
                <span className="text-xs px-2 py-1 rounded-full bg-muted">{pr.status}</span>
                <div className="ml-auto flex gap-2">
                  {pr.status!=="DONE" && (
                    <button onClick={()=>updateStatus.mutate({id:pr.id, status: next(pr.status)})}
                      className="px-3 py-2 rounded-lg bg-primary text-primary-foreground">Étape suivante</button>
                  )}
                </div>
              </div>
              {/* ROI / Risques (inline simple) */}
              <div className="mt-3 grid md:grid-cols-2 gap-3">
                <div className="text-sm">
                  <div className="font-medium">ROI estimé</div>
                  <div className="text-muted-foreground">{pr.roi_estimate || "—"}</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Risques</div>
                  <div className="text-muted-foreground">{pr.risks || "—"}</div>
                </div>
              </div>
              {/* Tâches */}
              <div className="mt-4">
                <div className="font-medium mb-2">Tâches</div>
                <div className="grid gap-2">
                  {pr.tasks?.map(t=>(
                    <label key={t.id} className="flex items-center gap-2">
                      <input type="checkbox" checked={!!t.done} onChange={e=>toggleTask.mutate({id:t.id, done:e.target.checked})}/>
                      <span className={t.done?"line-through text-muted-foreground":""}>{t.title}</span>
                    </label>
                  ))}
                  <AddTask onAdd={(title)=> addTask.mutate({project_id: pr.id, title}) } />
                </div>
              </div>
            </div>
          ))}
          {q.data && q.data.data.length===0 && <div className="text-center p-8 text-muted-foreground border rounded-xl">Aucun projet.</div>}
        </div>
      )}
    </div>
  );
}

function AddTask({ onAdd }:{ onAdd:(title:string)=>void }){
  const [v,setV]=useState("");
  return (
    <form onSubmit={(e)=>{e.preventDefault(); if(v.trim()){ onAdd(v.trim()); setV(""); }}} className="flex gap-2">
      <input value={v} onChange={e=>setV(e.target.value)} placeholder="Nouvelle tâche…" className="px-3 py-2 border rounded-lg flex-1"/>
      <button className="px-3 py-2 border rounded-lg">Ajouter</button>
    </form>
  );
}
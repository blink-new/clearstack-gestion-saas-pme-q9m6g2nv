import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, Paginated, toast } from "../../../lib/api";

type Software = {
  id: string; name: string; version?: string|null; category?: string|null;
  total_users?: number; total_contracts?: number; average_rating?: number|null;
};

export default function SoftwaresPage(){
  const qc = useQueryClient();
  const [search,setSearch] = useState("");
  const [page,setPage] = useState(1);
  const [showCreate,setShowCreate] = useState(false);

  const q = useQuery({
    queryKey:["softwares", {page, search}],
    queryFn:()=> apiFetch<Paginated<Software>>(`/softwares?page=${page}&limit=20&search=${encodeURIComponent(search)}`),
  });

  return (
    <div className="p-6 space-y-4">
      <header className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">Logiciels</h1>
        <div className="ml-auto flex gap-2">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Recherche (nom, catégorie)"
                 className="px-3 py-2 border rounded-lg w-64" />
          <button onClick={()=>setShowCreate(true)} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground">Ajouter</button>
        </div>
      </header>

{q.isLoading ? <div>Chargement…</div> : (
        <>
          {q.data && q.data.data.length===0 && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border text-sm">
              Aucun logiciel visible pour l'instant. <b>Ajoutez un contrat</b> lors de la création (ou depuis la fiche) pour lier le logiciel à votre société.
            </div>
          )}
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3">Nom</th>
                  <th className="text-left p-3">Catégorie</th>
                  <th className="text-left p-3">Version</th>
                  <th className="text-right p-3">Utilisateurs</th>
                  <th className="text-right p-3">Contrats</th>
                  <th className="text-right p-3">Note</th>
                </tr>
              </thead>
              <tbody>
                {q.data?.data.map(s=>(
                  <tr key={s.id} className="border-t hover:bg-muted/30">
                    <td className="p-3 font-medium">{s.name}</td>
                    <td className="p-3">{s.category || "—"}</td>
                    <td className="p-3">{s.version || "—"}</td>
                    <td className="p-3 text-right">{s.total_users ?? 0}</td>
                    <td className="p-3 text-right">{s.total_contracts ?? 0}</td>
                    <td className="p-3 text-right">{s.average_rating?.toFixed(1) ?? "—"}</td>
                  </tr>
                ))}
                {q.data && q.data.data.length===0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Aucun logiciel</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Pagination simple */}
      <div className="flex items-center justify-end gap-2">
        <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-3 py-2 border rounded-lg disabled:opacity-50">Préc.</button>
        <span className="text-sm">Page {page}</span>
        <button disabled={(q.data?.data?.length||0)<20} onClick={()=>setPage(p=>p+1)} className="px-3 py-2 border rounded-lg disabled:opacity-50">Suiv.</button>
      </div>

      {/* Modale création */}
      {showCreate && (
        <div className="fixed inset-0 grid place-items-center bg-black/30">
          <div className="bg-background rounded-2xl p-5 w-[520px] shadow-xl">
            <h2 className="text-lg font-semibold mb-3">Ajouter un logiciel</h2>
            <form className="space-y-3" onSubmit={async (e)=>{e.preventDefault();
              const fd=new FormData(e.currentTarget as HTMLFormElement);
              const body = {
                name: fd.get("name"), version: fd.get("version")||undefined,
                category: fd.get("category")||undefined, description: fd.get("description")||undefined,
                contract: (fd.get("cost_amount")? {
                  cost_amount: fd.get("cost_amount"),
                  billing_period: fd.get("billing_period")||"MONTH",
                  end_date: fd.get("end_date")||null,
                  notice_days: fd.get("notice_days")||95, currency:"EUR"
                }: null)
              };
              try {
                const { id } = await apiFetch("/softwares/create", { method:"POST", body: JSON.stringify(body) });
                toast(`Logiciel créé${body.contract?" avec contrat":""} (#${id})`);
                setShowCreate(false); qc.invalidateQueries({queryKey:["softwares"]});
              } catch (err:any) {
                console.error(err);
                toast("Erreur lors de la création : " + (err?.message || "inconnue"));
              }
            }}>
              <input name="name" placeholder="Nom *" className="w-full px-3 py-2 border rounded-lg" required />
              <div className="grid grid-cols-2 gap-3">
                <input name="version" placeholder="Version" className="px-3 py-2 border rounded-lg" />
                <input name="category" placeholder="Catégorie" className="px-3 py-2 border rounded-lg" />
              </div>
              <textarea name="description" placeholder="Description (optionnel)" className="w-full px-3 py-2 border rounded-lg" rows={3}/>

              <div className="mt-4 border-t pt-3">
                <div className="font-medium mb-2">Contrat (optionnel, recommandé)</div>
                <div className="grid grid-cols-2 gap-3">
                  <input name="cost_amount" type="number" step="0.01" min="0" placeholder="Coût (€ / période)" className="px-3 py-2 border rounded-lg" />
                  <select name="billing_period" className="px-3 py-2 border rounded-lg">
                    <option value="MONTH">Mensuel</option>
                    <option value="YEAR">Annuel</option>
                  </select>
                  <input name="end_date" type="date" className="px-3 py-2 border rounded-lg" />
                  <input name="notice_days" type="number" min="0" placeholder="Préavis (jours) – défaut 95" className="px-3 py-2 border rounded-lg" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Astuce : sans contrat, le logiciel peut ne pas apparaître dans la liste de votre parc.
                </p>
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
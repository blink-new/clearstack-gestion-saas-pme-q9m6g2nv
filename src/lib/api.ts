export const API_URL = import.meta.env.VITE_API_URL || "/api/v1";
function authHeaders(){ const t=localStorage.getItem("token")||sessionStorage.getItem("token"); return t?{Authorization:`Bearer ${t}`}:{ }; }
export async function apiFetch<T>(path:string, init:RequestInit={}):Promise<T>{
  const res = await fetch(`${API_URL}${path}`, { headers:{ "Content-Type":"application/json", ...authHeaders(), ...(init.headers||{}) }, credentials:"include", ...init });
  const ct = res.headers.get("content-type")||"";
  const text = await res.text().catch(()=> "");
  if (ct.includes("text/html")) throw new Error("API non atteinte (HTML reçu). Vérifie VITE_API_URL et le serveur.");
  if (!res.ok) throw new Error(text || res.statusText || `HTTP ${res.status}`);
  try { return text? JSON.parse(text) as T : (undefined as T); } catch { throw new Error("Réponse JSON invalide"); }
}
export function toast(m:string){ if(typeof window!=="undefined") alert(m); console.info("[Toast]",m); }

export type Paginated<T> = { data: T[]; total: number; page: number; limit: number };

export async function postAndGetId(path: string, body: any): Promise<string> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const text = await res.text().catch(()=> "");
  const headers = Object.fromEntries(res.headers.entries());
  console.debug("[postAndGetId]", path, res.status, headers, text);
  if (!res.ok && res.status !== 201 && res.status !== 200) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  let id: string | undefined;
  try { if (text) { const json = JSON.parse(text); id = json?.id || json?.data?.id; } } catch { /* ignore */ }
  if (!id) {
    const loc = res.headers.get("Location") || res.headers.get("location");
    if (loc) id = loc.split("/").filter(Boolean).pop();
  }
  if (!id) throw new Error("ID non renvoyé par l'API");
  return id!;
}

export async function findSoftwareIdByName(name:string): Promise<string|undefined>{
  try{
    const res = await apiFetch<{data:any[]}>(`/softwares?search=${encodeURIComponent(name)}&limit=1&page=1`);
    return res?.data?.[0]?.id;
  }catch{ return undefined; }
}

export async function findSoftwareIdLoosely(name:string): Promise<string|undefined>{
  try{
    const res = await apiFetch<{data:any[]}>("/softwares?limit=100&page=1");
    const now=Date.now();
    const hit = res.data.find(x => (x.name||"").toLowerCase()===name.toLowerCase() && (now - new Date(x.created_at).getTime()) < 60_000);
    return hit?.id;
  }catch{ return undefined; }
}
import { NavLink } from "react-router-dom";
const cls=({isActive}:{isActive:boolean})=>"flex items-center gap-3 px-4 py-3 rounded-lg "+(isActive?"bg-primary/10 text-primary":"hover:bg-muted");
export default function Sidebar(){
  return (
    <nav className="p-3 space-y-1">
      <NavLink to="/dashboard" className={cls}>📊 <span>Dashboard</span></NavLink>
      <NavLink to="/logiciels" className={cls}>🧩 <span>Logiciels</span></NavLink>
      <NavLink to="/demandes" className={cls}>📝 <span>Demandes</span></NavLink>
      <NavLink to="/projets" className={cls}>📦 <span>Projets</span></NavLink>
      <NavLink to="/import" className={cls}>⬆️ <span>Import</span></NavLink>
      <NavLink to="/notifications" className={cls}>🔔 <span>Notifications</span></NavLink>
      <NavLink to="/beta-flags" className={cls}>⚙️ <span>Bêta & Flags</span></NavLink>
      <NavLink to="/debug-api" className={cls}>🧪 <span>Debug API</span></NavLink>
    </nav>
  );
}
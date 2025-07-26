import { Outlet, Link } from "react-router-dom";
import Sidebar from "../modules/navigation/Sidebar";
import Footer from "./Footer";
export default function AppLayout(){
  return (
    <div className="min-h-screen grid grid-cols-[280px_1fr]">
      <aside className="border-r"><Sidebar/></aside>
      <div className="min-h-screen flex flex-col">
        <header className="h-14 flex items-center px-4 border-b">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img className="h-6 dark:hidden" src="/brand/clearstack-logo.svg" alt="ClearStack"/>
            <img className="h-6 hidden dark:block" src="/brand/clearstack-logo-dark.svg" alt="ClearStack"/>
          </Link>
        </header>
        <main id="app-content" className="flex-1 overflow-auto"><Outlet/></main>
        <Footer/>
      </div>
    </div>
  );
}
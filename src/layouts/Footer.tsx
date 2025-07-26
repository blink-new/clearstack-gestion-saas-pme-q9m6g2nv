import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer data-app-footer className="border-t px-6 py-3 text-sm text-muted-foreground">
      <div className="flex items-center gap-3 flex-wrap">
        <a href="/legal/privacy" className="hover:underline">Confidentialité</a>
        <span>•</span>
        <a href="/legal/terms" className="hover:underline">Mentions légales</a>
        <span className="ml-auto">© {year} ClearStack — Tous droits réservés</span>
      </div>
    </footer>
  );
}
import { useEffect } from "react";

export default function Bootstrap() {
  useEffect(() => {
    // analyticsInit(), overlayGuard() si besoin
    if (import.meta.env.MODE === 'development') {
      // Charger overlayGuard en mode développement
      import('../lib/overlayGuard').then(m => m.overlayGuard()).catch(console.warn);
    }
  }, []);
  
  return null;
}
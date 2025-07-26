// path: src/lib/overlayGuard.ts
export function overlayGuard(){
  document.addEventListener('click',(e)=>{
    const el=document.elementFromPoint(e.clientX,e.clientY);
    if(!el)return;
    const r=el.getBoundingClientRect();
    const big=r.width>innerWidth*0.9&&r.height>innerHeight*0.9;
    const pos=getComputedStyle(el).position; 
    if(big&&pos!=='static'){
      (el as HTMLElement).style.pointerEvents='none';
      console.warn('[overlayGuard] overlay neutralisé',el);
    }
  },{capture:true});
}
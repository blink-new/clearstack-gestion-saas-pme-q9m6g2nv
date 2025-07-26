import { Router } from "express";
import { prisma } from "../../db/client";
const r = Router();

r.get("/softwares/_probe", (req,res)=> res.json({ ok:true, route:"softwares" }));

r.post("/softwares", async (req,res,next)=>{
  try{
    const { name, version, category, description, website_url, logo_url } = req.body||{};
    if(!name) return res.status(400).json({code:"VALIDATION_ERROR", message:"name requis"});
    const s = await prisma.software.create({ data:{ name, version, category, description, website_url, logo_url }});
    res.status(201).set("Location", `/api/v1/softwares/${s.id}`).json({ id:s.id, ...s });
  }catch(e){ next(e); }
});

r.post("/softwares/create", async (req,res,next)=>{
  try{
    const { name, version, category, description, contract } = req.body||{};
    if(!name) return res.status(400).json({code:"VALIDATION_ERROR",message:"name requis"});
    const result = await prisma.$transaction(async(tx)=>{
      const s = await tx.software.create({ data:{ name, version, category, description }});
      if (contract?.cost_amount && contract?.billing_period){
        await tx.contract.create({ data:{
          software_id: s.id,
          cost_amount: Number(contract.cost_amount),
          billing_period: contract.billing_period, // MONTH | YEAR
          currency: contract.currency || "EUR",
          end_date: contract.end_date || null,
          notice_days: contract.notice_days ?? 95
        }});
      }
      return s;
    });
    res.status(201).json({ id: result.id });
  }catch(e){ next(e); }
});

r.post("/softwares/:id/contracts", async (req,res,next)=>{
  try{
    const { id } = req.params;
    const { cost_amount, currency="EUR", billing_period, start_date, end_date, notice_days=95, entity_id } = req.body||{};
    if(cost_amount==null || !billing_period) return res.status(400).json({code:"VALIDATION_ERROR", message:"cost_amount et billing_period requis"});
    const c = await prisma.contract.create({ data:{ software_id:id, entity_id:entity_id||null, cost_amount, currency, billing_period, start_date, end_date, notice_days }});
    res.status(201).set("Location", `/api/v1/contracts/${c.id}`).json({ id:c.id, ...c });
  }catch(e){ next(e); }
});

export default r;
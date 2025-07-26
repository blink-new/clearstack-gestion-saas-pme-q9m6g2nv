import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main(){
  const admin = await prisma.user.upsert({ where:{ email:"admin@demo.co" }, update:{}, create:{ email:"admin@demo.co", first_name:"Admin", last_name:"Demo", role:"ADMIN", company_id: (await prisma.company.create({data:{name:"Demo Co"}})).id }});
  const user = await prisma.user.upsert({ where:{ email:"user@demo.co" }, update:{}, create:{ email:"user@demo.co", first_name:"User", last_name:"Demo", role:"USER", company_id: admin.company_id }});
  console.log({admin:user?true:false, user:true});
}
main().finally(()=>prisma.$disconnect());
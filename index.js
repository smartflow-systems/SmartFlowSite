import express from "express";
const app = express(); app.use(express.json());

app.get("/health", (_,res)=>res.send("ok"));
app.post("/gh-sync",(req,res)=>{
  const ok=(req.get("authorization")||"")===`Bearer ${process.env.REPLIT_TOKEN}`;
  if(!ok) return res.status(401).send("nope");
  console.log("[SFS] Deploy:", {repo:req.body?.repo, sha:req.body?.sha});
  // TODO: git pull / build / restart, etc.
  res.json({status:"ok"});
});

app.listen(3000, ()=>console.log("SFS webhook up on :3000"));

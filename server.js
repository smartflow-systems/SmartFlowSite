const express=require("express");
const app=express(); app.use(express.json());
app.get("/health",(_r,res)=>res.send("ok"));
app.post("/gh-sync",(req,res)=>{
  const ok=(req.get("authorization")||"")===`Bearer ${process.env.REPLIT_TOKEN}`;
  if(!ok) return res.status(401).send("nope");
  console.log("[SFS] Deploy", {repo:req.body?.repo, sha:req.body?.sha});
  res.json({status:"ok"});
});
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>console.log("SFS webhook on:"+PORT));

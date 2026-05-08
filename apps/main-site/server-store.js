const express=require("express"),path=require("path");
const app=express(); const PORT=process.env.PORT||3000;
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));
app.get("/health",(_r,res)=>res.send("ok"));
app.post("/gh-sync",(req,res)=>{
  const ok=(req.get("authorization")||"")===`Bearer ${process.env.REPLIT_TOKEN}`;
  if(!ok) return res.status(401).send("nope");
  console.log("[SFS] Deploy", req.body); res.json({status:"ok"});
});
app.get("/",(_r,res)=>res.redirect("/landing"));
app.listen(PORT,()=>console.log(`SmartFlow static on :${PORT}`));

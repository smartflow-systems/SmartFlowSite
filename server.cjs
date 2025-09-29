const express = require("express");
const compression = require("compression");
const app = express();
app.use(compression());
app.use(express.static("public",{
  maxAge:"7d",
  setHeaders:(res,p)=>{ if(p.endsWith(".html")) res.setHeader("Cache-Control","no-store"); }
}));
app.get("/health",(_,res)=>res.json({ok:true,service:"SmartFlowSite"}));
app.listen(process.env.PORT||5000,()=>console.log("SmartFlowSite up on",process.env.PORT||5000));

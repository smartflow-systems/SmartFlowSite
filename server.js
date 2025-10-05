import express from 'express'; import cors from 'cors'; import path from 'path'; import { fileURLToPath } from 'url';
const __filename=fileURLToPath(import.meta.url), __dirname=path.dirname(__filename);
const app=express(); app.use(cors()); app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));
app.get('/health',(_req,res)=>res.json({ok:true,service:'SmartFlowSite'}));
const port=process.env.PORT||5000; app.listen(port,()=>console.log('SmartFlowSite on',port));

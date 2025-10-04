// SmartFlowSite mini server (CJS)
const http=require('http'),fs=require('fs'),path=require('path');
const PORT=process.env.PORT||5000;
const MIME={'.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
const sendJson=(res,code,body,extra={})=>{res.writeHead(code,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*',...extra});res.end(JSON.stringify(body));};
const serve=(req,res)=>{const url=req.url.split('?')[0];const rel=url==='/'?'/index.html':url;const safe=path.normalize(rel).replace(/^(\.\.[/\\])+/, '');const fp=path.join(__dirname,'public',safe);
  fs.stat(fp,(e,st)=>{if(e||!st.isFile())return sendJson(res,404,{error:'Not found'});const ext=path.extname(fp).toLowerCase();res.writeHead(200,{'Content-Type':MIME[ext]||'application/octet-stream','Access-Control-Allow-Origin':'*'});fs.createReadStream(fp).pipe(res);});
};
const server=http.createServer((req,res)=>{if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type'});return res.end();}
  if(req.url==='/health') return sendJson(res,200,{ok:true,service:'SmartFlowSite'}); return serve(req,res);});
server.listen(PORT,()=>console.log(`SmartFlowSite listening on :${PORT}`));

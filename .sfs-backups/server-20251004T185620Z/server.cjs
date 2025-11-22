const http=require('http'),fs=require('fs'),path=require('path');
const PORT=process.env.PORT||5000;
const send=(res,code,body,h={})=>{res.writeHead(code,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*',...h});res.end(JSON.stringify(body));};
const serve=(req,res)=>{const f=req.url==='/'?'/index.html':req.url;const p=path.join(__dirname,'public',f);
  fs.readFile(p,(e,d)=> e? send(res,404,{error:'Not found'}): (res.writeHead(200,{'Content-Type':p.endsWith('.css')?'text/css':'text/html'}),res.end(d)));};
http.createServer((req,res)=>{
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type'});return res.end();}
  if(req.url==='/health') return send(res,200,{ok:true});
  if(req.url==='/api/boost' && req.method==='GET') return send(res,200,{boost:'ok',ts:new Date().toISOString()});
  return serve(req,res);
}).listen(PORT,()=>console.log('SmartFlow running on',PORT));

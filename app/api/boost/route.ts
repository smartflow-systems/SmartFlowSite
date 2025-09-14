import { NextResponse as R } from "next/server";
const H={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,OPTIONS","Access-Control-Allow-Headers":"Content-Type","Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"};
export function GET(){const d={ok:true,version:"v0.2",boosts:[{id:1,name:"Hashtag Sweep",hint:"clean+expand"},{id:2,name:"Caption Spark",hint:"hook+CTA"},{id:3,name:"Post Timer",hint:"best-time"}],ts:new Date().toISOString()};return new R(JSON.stringify(d),{headers:H});}
export function OPTIONS(){return new R(null,{headers:H});}

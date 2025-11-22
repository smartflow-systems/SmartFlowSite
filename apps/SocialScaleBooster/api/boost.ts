import type { NextApiRequest, NextApiResponse } from "next";
export default function handler(req:NextApiRequest,res:NextApiResponse){
  res.setHeader("Access-Control-Allow-Origin","*");
  if(req.method==="OPTIONS"){res.status(200).end();return;}
  res.status(200).json({ ok:true, ts:Date.now(), count:1 });
}

import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
export const runtime = "nodejs";

const H = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

export async function GET() {
  const raw = await readFile(process.cwd() + "/data/boosts.json", "utf8");
  const boosts = JSON.parse(raw);
  const body = { ok: true, version: "v0.2", boosts, ts: new Date().toISOString() };
  return new NextResponse(JSON.stringify(body), { headers: H });
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: H });
}

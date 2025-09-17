import { NextResponse } from "next/server";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
export async function GET() {
  try {
    const dir = ".sfs/health";
    const files = readdirSync(dir).filter(f=>/^check-.*\.txt$/.test(f)).sort();
    const latest = files.at(-1);
    if (!latest) return NextResponse.json({ ok:false, message:"no markers" }, { status:404 });
    const body = readFileSync(join(dir, latest), "utf8");
    const obj: Record<string,string> = {};
    for (const line of body.split("\n")) {
      const i = line.indexOf("="); 
      if (i>0) obj[line.slice(0,i).trim()] = line.slice(i+1).trim();
    }
    return NextResponse.json({ ok:true, file: latest, ...obj });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e.message }, { status:500 });
  }
}

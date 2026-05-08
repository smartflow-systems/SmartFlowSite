#!/usr/bin/env python3
import argparse, os, sys, time, json
from typing import Dict, Any, List
import requests

API = "https://api.github.com"

def fatal(msg: str, code: int = 1) -> None:
    print(f"❌ {msg}", file=sys.stderr); sys.exit(code)

def load_matrix(path: str) -> List[Dict[str, str]]:
    try:
        if path.endswith((".yml", ".yaml")):
            import yaml  # type: ignore
            with open(path, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f) or {}
            return data.get("repos", [])
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f).get("repos", [])
    except FileNotFoundError:
        fatal(f"config not found: {path}")
    except Exception as e:
        fatal(f"failed to read {path}: {e}")

def dispatch(owner: str, repo: str, ref: str, wf: str, token: str, inputs: Dict[str, Any], tries: int = 3, delay: float = 0.8) -> bool:
    url = f"{API}/repos/{owner}/{repo}/actions/workflows/{wf}/dispatches"
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"}
    payload: Dict[str, Any] = {"ref": ref}
    if inputs: payload["inputs"] = inputs
    for i in range(1, tries+1):
        r = requests.post(url, headers=headers, json=payload, timeout=20)
        if r.status_code == 204:
            print(f"✅ Dispatched {owner}/{repo}:{ref} → {wf} (try {i})")
            return True
        print(f"⚠️  {owner}/{repo}:{ref} → {wf} failed (try {i}) [{r.status_code}] {r.text.strip()}")
        time.sleep(delay*i)
    return False

def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--config", default=".github/dispatch-matrix.yml")
    p.add_argument("--only", nargs="*", help="Repo name(s) to include")
    p.add_argument("--inputs", nargs="*", default=[], help="key=value pairs")
    p.add_argument("--all", action="store_true")
    args = p.parse_args()

    token = os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN")
    if not token: fatal("Set GITHUB_TOKEN (scopes: repo, workflow)")

    inputs: Dict[str, Any] = {}
    for kv in args.inputs:
        if "=" not in kv: fatal(f"bad input '{kv}', expected key=value")
        k,v = kv.split("=",1); inputs[k]=v

    repos = load_matrix(args.config)
    if not repos: fatal("no repos in config")
    if args.only:
        keep = set(args.only)
        repos = [r for r in repos if r.get("repo") in keep]
        if not repos: fatal("no matching repos after --only")

    if not args.all and not args.only:
        fatal("nothing to do. Use --all or --only <repo>")

    ok = True
    for r in repos:
        owner=r.get("owner"); repo=r.get("repo"); ref=r.get("ref","main"); wf=r.get("workflow","ci.yml")
        if not all([owner,repo,wf]):
            print(f"⏭️  skip invalid row: {r}")
            continue
        if not dispatch(owner, repo, ref, wf, token, inputs): ok=False
    sys.exit(0 if ok else 2)

if __name__ == "__main__":
    main()

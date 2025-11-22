import os, json, sys, pathlib
def fail(m): print("❌", m); sys.exit(1)
def ok(m): print("✅", m)
rules = pathlib.Path("docs/SmartFlow-Agent-Rules.md")
if not rules.exists(): fail("docs/SmartFlow-Agent-Rules.md is missing")
txt = rules.read_text(encoding="utf-8").lower()
need_words = ["apply-all","verify","undo","bundle & apply now?"]
event_path = os.environ.get("GITHUB_EVENT_PATH")
if not event_path or not os.path.exists(event_path):
  ok("Local mode: file exists"); sys.exit(0)
ev = json.load(open(event_path, "r", encoding="utf-8"))
body = (ev.get("pull_request",{}).get("body") or "").lower()
miss = [w for w in need_words if w not in body]
if miss: fail("PR body missing: " + ", ".join(miss))
ok("Rules file present"); ok("PR body includes required sections")

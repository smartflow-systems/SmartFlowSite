# Security notes (Python)

- **Do not run the Werkzeug debugger in production.**
  Set `FLASK_ENV=production` / `DEBUG=0` and never expose the debug PIN.
- **Cap upload size** at the web server and app (prevents resource exhaustion).
  Example (Gunicorn env): `WEB_MAX_CONTENT_LENGTH=10_000_000` and app-side guards.
- **Normalize/limit proxy headers** (prevents request-smuggling confusion).
  In Gunicorn behind a proxy, set `--forwarded-allow-ips=<proxy-ip-list>` (not `*`).
- Keep `gunicorn` and `werkzeug` **patched** via Dependabot PRs.

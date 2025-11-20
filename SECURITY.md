# Security notes (Python)

- **Do not run the Werkzeug debugger in production.**
  Set `FLASK_ENV=production` / `DEBUG=0` and never expose the debug PIN.
- **Cap upload size** at the web server and app (prevents resource exhaustion).
  Example (Gunicorn env): `WEB_MAX_CONTENT_LENGTH=10_000_000` and app-side guards.
- **Normalize/limit proxy headers** (prevents request-smuggling confusion).
  In Gunicorn behind a proxy, set `--forwarded-allow-ips=<proxy-ip-list>` (not `*`).
- Keep `gunicorn` and `werkzeug` **patched** via Dependabot PRs.

## Known Unfixable Vulnerabilities

### GHSA-wj6h-64fc-37mp (ecdsa)
- **Vulnerability**: Minerva timing attack on ECDSA P-256 curve
- **Status**: No fix available - maintainers consider side-channel attacks out of scope
- **Mitigation**: We use `python-jose[cryptography]` which prefers the cryptography backend over ecdsa, minimizing exposure to this vulnerability
- **Impact**: Low - timing attacks require significant resources and specific conditions
- **Decision**: Suppressed in pip-audit workflow
- **Reviewed by**: Security Team
- **Date**: 2025-11-15
- **Next review**: 2026-01-15
- **Reference**: https://github.com/advisories/GHSA-wj6h-64fc-37mp

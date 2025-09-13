# at top (or keep if you already have them)
from pathlib import Path
from flask import send_from_directory, abort

# base dir for data (adjust BASE if you already define it elsewhere)
BASE = Path(__file__).resolve().parent
DATA_ROOT = (BASE / "data").resolve()

# REPLACE your existing /data route with this:
@app.route("/data/<path:fname>")
def data_files(fname: str):
    """
    Safely serve files from DATA_ROOT only:
    - Resolve path relative to DATA_ROOT
    - Ensure the final path stays within DATA_ROOT
    - Restrict to allowed extensions
    """
    try:
        # Resolve the candidate WITHOUT requiring it to exist yet
        candidate = (DATA_ROOT / fname).resolve(strict=False)
    except Exception:
        abort(400)  # bad input (e.g. invalid characters)

    # Ensure path containment: candidate must be under DATA_ROOT
    try:
        rel = candidate.relative_to(DATA_ROOT)
    except ValueError:
        abort(403)  # attempted traversal outside DATA_ROOT

    # Extension allow-list (tune as needed)
    allowed_ext = {
        ".json", ".csv", ".txt", ".md",
        ".png", ".jpg", ".jpeg", ".gif", ".webp",
        ".pdf"
    }
    if candidate.suffix.lower() not in allowed_ext:
        abort(415)  # unsupported media type

    # Must exist and be a regular file
    if not candidate.exists() or not candidate.is_file():
        abort(404)

    # Serve safely from the fixed root
    return send_from_directory(
        DATA_ROOT.as_posix(),
        rel.as_posix(),
        as_attachment=False,
        etag=True,
        conditional=True,
        max_age=0,
    )

import os
from flask import abort
def safe_file_access(user_input):
    safe_root = os.path.abspath("data")
    target_path = os.path.abspath(os.path.join(safe_root, user_input))
    if not target_path.startswith(safe_root): abort(403)
    if not os.path.exists(target_path): abort(404)
    return target_path

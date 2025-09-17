from flask import Blueprint, send_file
from app.api.utils import safe_file_access
router = Blueprint("test_route", __name__)
@router.route("/test/<path:filename>")
def test_file(filename):
    return send_file(safe_file_access(filename))

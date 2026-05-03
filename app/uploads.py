import os
from flask import Blueprint, abort, current_app, send_from_directory

uploads_bp = Blueprint("uploads", __name__)


@uploads_bp.get("/uploads/<path:filename>")
def uploads(filename: str):
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    full_path = os.path.join(upload_folder, filename)
    if not os.path.isfile(full_path):
        abort(404)
    return send_from_directory(upload_folder, filename)


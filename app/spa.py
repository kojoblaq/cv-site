import os
from pathlib import Path

from flask import Blueprint, current_app, send_from_directory

spa_bp = Blueprint("spa", __name__)


def _dist_dir() -> Path:
    # built output copied to /frontend/dist then served by Flask
    root = Path(current_app.root_path).parent
    return root / "frontend" / "dist"


@spa_bp.get("/")
def spa_index():
    dist = _dist_dir()
    index = dist / "index.html"
    if index.exists():
        return send_from_directory(dist, "index.html")
    return (
        "React frontend not built yet. Run `npm run dev` in /frontend for development, or `npm run build` for production.",
        200,
    )


@spa_bp.get("/<path:path>")
def spa_assets_or_fallback(path: str):
    dist = _dist_dir()
    file_path = dist / path
    if file_path.exists() and file_path.is_file():
        return send_from_directory(dist, path)
    # client-side routes fallback to index.html
    index = dist / "index.html"
    if index.exists():
        return send_from_directory(dist, "index.html")
    return ("Not found.", 404)


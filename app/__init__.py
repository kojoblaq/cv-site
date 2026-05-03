import os
from flask import Flask

from .extensions import db, login_manager
from .models import User


def create_app():
    app = Flask(__name__, instance_relative_config=True)

    os.makedirs(app.instance_path, exist_ok=True)
    os.makedirs(os.path.join(app.instance_path, "uploads"), exist_ok=True)

    app.config.from_mapping(
        SECRET_KEY=os.environ.get("SECRET_KEY", "dev-change-me"),
        SQLALCHEMY_DATABASE_URI=os.environ.get("DATABASE_URL", f"sqlite:///{os.path.join(app.instance_path, 'app.db')}"),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        UPLOAD_FOLDER=os.environ.get("UPLOAD_FOLDER", os.path.join(app.instance_path, "uploads")),
        MAX_CONTENT_LENGTH=25 * 1024 * 1024,
    )

    db.init_app(app)
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id: str):
        return db.session.get(User, int(user_id))

    from flask_cors import CORS

    # For local dev with Vite (http://127.0.0.1:5173). In prod, you’ll serve React from Flask.
    dev_origin = os.environ.get("FRONTEND_DEV_ORIGIN", "http://127.0.0.1:5173")
    CORS(app, resources={r"/api/*": {"origins": [dev_origin]}}, supports_credentials=True)

    from .blueprints.api.routes import bp as api_bp

    app.register_blueprint(api_bp, url_prefix="/api")

    from .uploads import uploads_bp

    app.register_blueprint(uploads_bp)

    # SPA fallback (serve React build if present)
    from .spa import spa_bp

    app.register_blueprint(spa_bp)

    from .cli import register_cli

    register_cli(app)

    return app


from __future__ import annotations

import os
import secrets
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request
from flask_login import current_user, login_required, login_user, logout_user
from PIL import Image

from ...extensions import db
from ...models import Achievement, Experience, MediaItem, Profile, SiteSettings, Skill, User

bp = Blueprint("api", __name__)


def _json_error(message: str, status: int = 400):
    return jsonify({"ok": False, "error": message}), status


def _require_json():
    if not request.is_json:
        return False
    return True


def _profile_dict(p: Profile | None):
    if not p:
        return None
    return {
        "id": p.id,
        "full_name": p.full_name,
        "headline": p.headline,
        "location": p.location,
        "phone": p.phone,
        "email": p.email,
        "linkedin_url": p.linkedin_url,
        "summary": p.summary,
        "hero_image": p.hero_image,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }


def _experience_dict(e: Experience):
    return {
        "id": e.id,
        "title": e.title,
        "company": e.company,
        "location": e.location,
        "start": e.start,
        "end": e.end,
        "bullets": [line for line in (e.bullets or "").splitlines() if line.strip()],
        "sort_order": e.sort_order,
    }


def _skill_dict(s: Skill):
    return {
        "id": s.id,
        "category": s.category,
        "items": [line for line in (s.items or "").splitlines() if line.strip()],
        "sort_order": s.sort_order,
    }


def _achievement_dict(a: Achievement):
    return {"id": a.id, "text": a.text, "sort_order": a.sort_order}


def _media_dict(m: MediaItem):
    return {
        "id": m.id,
        "title": m.title,
        "description": m.description,
        "filename": m.filename,
        "url": f"/uploads/{m.filename}",
        "created_at": m.created_at.isoformat() if m.created_at else None,
    }

def _settings_dict(s: SiteSettings | None):
    if not s:
        return {"primary_color": "#84cc16", "secondary_color": "#6366f1"}
    return {"primary_color": s.primary_color, "secondary_color": s.secondary_color, "updated_at": s.updated_at.isoformat() if s.updated_at else None}


def _safe_image_save(file_storage) -> str | None:
    if not file_storage or not getattr(file_storage, "filename", None):
        return None

    ext = Path(file_storage.filename).suffix.lower().lstrip(".")
    if ext not in {"jpg", "jpeg", "png", "webp"}:
        raise ValueError("Only JPG, PNG, or WEBP images are allowed.")

    rand = secrets.token_hex(16)
    filename = f"{rand}.{ext}"
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_folder, exist_ok=True)
    dest = os.path.join(upload_folder, filename)

    img = Image.open(file_storage.stream)
    img = img.convert("RGB")
    img.thumbnail((2400, 2400))
    img.save(dest, quality=88, optimize=True)
    return filename


@bp.get("/health")
def health():
    return jsonify({"ok": True})


@bp.get("/public")
def public_payload():
    profile = db.session.query(Profile).order_by(Profile.id.asc()).first()
    settings = db.session.query(SiteSettings).order_by(SiteSettings.id.asc()).first()
    experiences = db.session.query(Experience).order_by(Experience.sort_order.asc(), Experience.id.asc()).all()
    skills = db.session.query(Skill).order_by(Skill.sort_order.asc(), Skill.id.asc()).all()
    achievements = db.session.query(Achievement).order_by(Achievement.sort_order.asc(), Achievement.id.asc()).all()
    media = db.session.query(MediaItem).order_by(MediaItem.created_at.desc()).limit(24).all()
    return jsonify(
        {
            "ok": True,
            "settings": _settings_dict(settings),
            "profile": _profile_dict(profile),
            "experiences": [_experience_dict(e) for e in experiences],
            "skills": [_skill_dict(s) for s in skills],
            "achievements": [_achievement_dict(a) for a in achievements],
            "media": [_media_dict(m) for m in media],
        }
    )


@bp.get("/auth/me")
def auth_me():
    if not current_user.is_authenticated:
        return jsonify({"ok": True, "user": None})
    return jsonify({"ok": True, "user": {"id": current_user.id, "email": current_user.email}})


@bp.post("/auth/login")
def auth_login():
    if not _require_json():
        return _json_error("Expected JSON body.", 415)

    email = (request.json.get("email") or "").strip().lower()
    password = request.json.get("password") or ""
    user = db.session.query(User).filter_by(email=email).first()
    if not user or not user.check_password(password):
        return _json_error("Invalid email or password.", 401)

    login_user(user, remember=True)
    return jsonify({"ok": True, "user": {"id": user.id, "email": user.email}})


@bp.post("/auth/logout")
def auth_logout():
    logout_user()
    return jsonify({"ok": True})


@bp.get("/admin/profile")
@login_required
def admin_get_profile():
    profile = db.session.query(Profile).order_by(Profile.id.asc()).first()
    return jsonify({"ok": True, "profile": _profile_dict(profile)})


@bp.put("/admin/profile")
@login_required
def admin_update_profile():
    if not _require_json():
        return _json_error("Expected JSON body.", 415)

    profile = db.session.query(Profile).order_by(Profile.id.asc()).first()
    if not profile:
        profile = Profile(full_name="Your Name", headline="Your headline")
        db.session.add(profile)

    data = request.json
    for key in ["full_name", "headline", "location", "phone", "email", "linkedin_url", "summary", "hero_image"]:
        if key in data:
            setattr(profile, key, (data.get(key) or "").strip() if isinstance(data.get(key), str) else data.get(key))

    db.session.commit()
    return jsonify({"ok": True, "profile": _profile_dict(profile)})


@bp.get("/admin/experience")
@login_required
def admin_list_experience():
    items = db.session.query(Experience).order_by(Experience.sort_order.asc(), Experience.id.asc()).all()
    return jsonify({"ok": True, "items": [_experience_dict(e) for e in items]})


@bp.post("/admin/experience")
@login_required
def admin_create_experience():
    if not _require_json():
        return _json_error("Expected JSON body.", 415)
    data = request.json
    item = Experience(
        title=(data.get("title") or "").strip(),
        company=(data.get("company") or "").strip(),
        location=(data.get("location") or "").strip(),
        start=(data.get("start") or "").strip(),
        end=(data.get("end") or "").strip(),
        bullets="\n".join(data.get("bullets") or []) if isinstance(data.get("bullets"), list) else (data.get("bullets") or "").strip(),
        sort_order=int(data.get("sort_order") or 0),
    )
    db.session.add(item)
    db.session.commit()
    return jsonify({"ok": True, "item": _experience_dict(item)})


@bp.put("/admin/experience/<int:item_id>")
@login_required
def admin_update_experience(item_id: int):
    if not _require_json():
        return _json_error("Expected JSON body.", 415)
    item = db.session.get(Experience, item_id)
    if not item:
        return _json_error("Not found.", 404)
    data = request.json
    for key in ["title", "company", "location", "start", "end"]:
        if key in data:
            setattr(item, key, (data.get(key) or "").strip())
    if "bullets" in data:
        item.bullets = "\n".join(data.get("bullets") or []) if isinstance(data.get("bullets"), list) else (data.get("bullets") or "").strip()
    if "sort_order" in data:
        item.sort_order = int(data.get("sort_order") or 0)
    db.session.commit()
    return jsonify({"ok": True, "item": _experience_dict(item)})


@bp.delete("/admin/experience/<int:item_id>")
@login_required
def admin_delete_experience(item_id: int):
    item = db.session.get(Experience, item_id)
    if not item:
        return _json_error("Not found.", 404)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"ok": True})


@bp.get("/admin/skills")
@login_required
def admin_list_skills():
    items = db.session.query(Skill).order_by(Skill.sort_order.asc(), Skill.id.asc()).all()
    return jsonify({"ok": True, "items": [_skill_dict(s) for s in items]})


@bp.post("/admin/skills")
@login_required
def admin_create_skill():
    if not _require_json():
        return _json_error("Expected JSON body.", 415)
    data = request.json
    item = Skill(
        category=(data.get("category") or "").strip() or "Category",
        items="\n".join(data.get("items") or []) if isinstance(data.get("items"), list) else (data.get("items") or "").strip(),
        sort_order=int(data.get("sort_order") or 0),
    )
    db.session.add(item)
    db.session.commit()
    return jsonify({"ok": True, "item": _skill_dict(item)})


@bp.put("/admin/skills/<int:item_id>")
@login_required
def admin_update_skill(item_id: int):
    if not _require_json():
        return _json_error("Expected JSON body.", 415)
    item = db.session.get(Skill, item_id)
    if not item:
        return _json_error("Not found.", 404)
    data = request.json
    if "category" in data:
        item.category = (data.get("category") or "").strip() or item.category
    if "items" in data:
        item.items = "\n".join(data.get("items") or []) if isinstance(data.get("items"), list) else (data.get("items") or "").strip()
    if "sort_order" in data:
        item.sort_order = int(data.get("sort_order") or 0)
    db.session.commit()
    return jsonify({"ok": True, "item": _skill_dict(item)})


@bp.delete("/admin/skills/<int:item_id>")
@login_required
def admin_delete_skill(item_id: int):
    item = db.session.get(Skill, item_id)
    if not item:
        return _json_error("Not found.", 404)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"ok": True})


@bp.get("/admin/achievements")
@login_required
def admin_list_achievements():
    items = db.session.query(Achievement).order_by(Achievement.sort_order.asc(), Achievement.id.asc()).all()
    return jsonify({"ok": True, "items": [_achievement_dict(a) for a in items]})


@bp.post("/admin/achievements")
@login_required
def admin_create_achievement():
    if not _require_json():
        return _json_error("Expected JSON body.", 415)
    data = request.json
    item = Achievement(text=(data.get("text") or "").strip(), sort_order=int(data.get("sort_order") or 0))
    db.session.add(item)
    db.session.commit()
    return jsonify({"ok": True, "item": _achievement_dict(item)})


@bp.put("/admin/achievements/<int:item_id>")
@login_required
def admin_update_achievement(item_id: int):
    if not _require_json():
        return _json_error("Expected JSON body.", 415)
    item = db.session.get(Achievement, item_id)
    if not item:
        return _json_error("Not found.", 404)
    data = request.json
    if "text" in data:
        item.text = (data.get("text") or "").strip()
    if "sort_order" in data:
        item.sort_order = int(data.get("sort_order") or 0)
    db.session.commit()
    return jsonify({"ok": True, "item": _achievement_dict(item)})


@bp.delete("/admin/achievements/<int:item_id>")
@login_required
def admin_delete_achievement(item_id: int):
    item = db.session.get(Achievement, item_id)
    if not item:
        return _json_error("Not found.", 404)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"ok": True})


@bp.get("/media")
def media_list():
    items = db.session.query(MediaItem).order_by(MediaItem.created_at.desc()).limit(48).all()
    return jsonify({"ok": True, "items": [_media_dict(m) for m in items]})


@bp.get("/admin/media")
@login_required
def admin_list_media():
    items = db.session.query(MediaItem).order_by(MediaItem.created_at.desc()).all()
    return jsonify({"ok": True, "items": [_media_dict(m) for m in items]})


@bp.post("/admin/media")
@login_required
def admin_upload_media():
    # multipart/form-data
    try:
        filename = _safe_image_save(request.files.get("file"))
    except ValueError as e:
        return _json_error(str(e), 400)

    if not filename:
        return _json_error("No file provided.", 400)

    title = (request.form.get("title") or "").strip()
    description = (request.form.get("description") or "").strip()
    item = MediaItem(title=title, description=description, filename=filename)
    db.session.add(item)
    db.session.commit()
    return jsonify({"ok": True, "item": _media_dict(item)})


@bp.delete("/admin/media/<int:item_id>")
@login_required
def admin_delete_media(item_id: int):
    item = db.session.get(MediaItem, item_id)
    if not item:
        return _json_error("Not found.", 404)

    path = os.path.join(current_app.config["UPLOAD_FOLDER"], item.filename)
    try:
        if os.path.isfile(path):
            os.remove(path)
    finally:
        db.session.delete(item)
        db.session.commit()
    return jsonify({"ok": True})


@bp.get("/admin/settings")
@login_required
def admin_get_settings():
    settings = db.session.query(SiteSettings).order_by(SiteSettings.id.asc()).first()
    if not settings:
        settings = SiteSettings(primary_color="#84cc16", secondary_color="#6366f1")
        db.session.add(settings)
        db.session.commit()
    return jsonify({"ok": True, "settings": _settings_dict(settings)})


@bp.put("/admin/settings")
@login_required
def admin_update_settings():
    if not _require_json():
        return _json_error("Expected JSON body.", 415)
    settings = db.session.query(SiteSettings).order_by(SiteSettings.id.asc()).first()
    if not settings:
        settings = SiteSettings(primary_color="#84cc16", secondary_color="#6366f1")
        db.session.add(settings)
    data = request.json or {}
    primary = (data.get("primary_color") or "").strip()
    secondary = (data.get("secondary_color") or "").strip()
    if primary:
        settings.primary_color = primary
    if secondary:
        settings.secondary_color = secondary
    db.session.commit()
    return jsonify({"ok": True, "settings": _settings_dict(settings)})


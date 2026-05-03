# CV Site — React frontend + Flask API + Admin CMS

A portfolio / CV website with a hidden admin area to edit profile, experience, skills, achievements, media uploads, and theme colors.

---

## What you need installed

| Tool | Why |
|------|-----|
| **Python 3** | Runs the API and serves uploads |
| **Node.js** (includes `npm`) | Builds and runs the React site |

On Windows, use **PowerShell** for the commands below.

---

## Project layout (quick mental map)

| Path | Role |
|------|------|
| `run.py` | Starts Flask |
| `app/` | API, database models, uploads |
| `frontend/` | React (Vite) UI |
| `instance/app.db` | SQLite database (created after `init-db`) |
| `instance/uploads/` | Uploaded images |

---

## Setup in 5 minutes (local development)

You run **two processes**: Flask (backend) and Vite (frontend). The React app talks to the API through a proxy on port **5173**.

### 1) Backend (first terminal)

From the project root (folder that contains `run.py`):

```powershell
# One-time: create virtual environment
py -m venv .venv

# Activate it (every new terminal)
.\.venv\Scripts\Activate.ps1

# One-time (or after dependency changes)
pip install -r requirements.txt

# One-time: environment file
copy .env.example .env

# One-time: create tables and sample data + admin user
flask --app run.py init-db
flask --app run.py seed

# Start API (leave this running)
flask --app run.py run --debug
```

API base URL: **http://127.0.0.1:5000**  
Health check: **http://127.0.0.1:5000/api/health**

### 2) Frontend (second terminal)

```powershell
cd frontend
npm install
npm run dev
```

Open **http://127.0.0.1:5173**

---

## Admin (CMS)

1. On the public site, scroll to the footer and click the **small lock icon** (hidden entry).
2. Sign in with the seeded account (change password in production):

| Field | Value (after `seed`) |
|--------|----------------------|
| Email | `admin@local` |
| Password | `admin12345` |

In the admin you can edit **Profile**, **Experience**, **Skills**, **Achievements**, **Media**, and **Theme** (primary / secondary colors).

### Hero portrait

- Upload a PNG in **Media**, or set **Profile → Hero image URL** to something like `/uploads/your-file.png` (paths are relative to the site root).

---

## Production (single server — Flask serves the built React app)

1. Build the frontend:

```powershell
cd frontend
npm install
npm run build
```

2. Run Flask with a production WSGI server (e.g. **Waitress** on Windows, or **Gunicorn** on Linux) and set a strong **`SECRET_KEY`** in your environment (see `.env.example`).

Flask is set up to serve **`frontend/dist`** when you open the site root.

---

## Environment variables (reference)

Copy `.env.example` to `.env` and adjust:

- **`SECRET_KEY`** — required for real deployments; use a long random string.
- **`ADMIN_EMAIL` / `ADMIN_PASSWORD`** — used only when running `flask seed` the first time.
- **`FRONTEND_DEV_ORIGIN`** — defaults to `http://127.0.0.1:5173` for CORS during local dev.

---

## Troubleshooting

**“Running scripts is disabled” when activating `.venv`**  
PowerShell execution policy is blocking scripts. Either run as Administrator once:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

or activate using `cmd` instead of PowerShell.

**Blank page on port 5000 in dev**  
In development, use **http://127.0.0.1:5173** for the UI. Port 5000 is mainly the API unless you’ve built the frontend and rely on Flask to serve `dist`.

**Admin login fails**  
Run `flask --app run.py seed` again (it’s safe for adding missing defaults) or reset credentials via your `.env` and re-seed on a fresh database.

---

## License / handover

Hand off the project folder, `.env` (with production secrets), and a note to run **`init-db`** + **`seed`** on a new machine if starting from scratch.

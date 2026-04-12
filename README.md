# NIAT Insider — Moderator Platform

Secure moderator dashboard: **JWT login**, **campus-scoped articles** (MongoDB + Express + React + TypeScript).

## Prerequisites

- **Node.js** 20+ (recommended)
- **MongoDB** running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI

## Clone and install

```bash
git clone <your-repo-url> niat-insider
cd niat-insider
```

Install dependencies for **both** apps:

```bash
cd server && npm install && cd ..
cd client && npm install && cd ..
```

## Environment files

Real `.env` files are **not** committed. Copy the tracked `*.example` files and rename them:

| Example | Copy to | Used when |
|--------|---------|-----------|
| `server/env.development.example` | `server/.env` | Local API (`npm run dev`) |
| `server/env.test.example` | `server/.env.test` | Test port / DB (`npm run start:test`) |
| `server/env.production.example` | `server/.env.production` | Production (`npm start`) |
| `client/env.development.example` | `client/.env.development` or `client/.env.local` | Vite dev |
| `client/env.test.example` | `client/.env.test` | `npm run build:test` |
| `client/env.production.example` | `client/.env.production` | `npm run build` |

### Critical values

- **`CORS_ORIGIN` (server)** must include the **exact origin** of the React app (e.g. `http://localhost:5173` for Vite). Multiple origins: comma-separated, e.g. `http://localhost:5173,http://localhost:3000`.
- **`VITE_API_BASE_URL` (client)** must match the API base (scheme + host + port), **no trailing slash**, e.g. `http://localhost:5000`.

After changing client env files, restart the Vite dev server.

## Run locally (development)

**Terminal 1 — API**

```bash
cd server
cp env.development.example .env   # first time only; edit MONGODB_URI / secrets
npm run build
npm run dev
```

**Terminal 2 — Client**

```bash
cd client
cp env.development.example .env.development   # first time; set VITE_API_BASE_URL if not using default
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Sign in with accounts created as described below.

### How to add an admin

There is **no** “register as admin” screen in the app. The **first (and typical) admin** is created **once** on the machine that can reach MongoDB:

1. Ensure `server/.env` exists and **`MONGODB_URI`** points at your database (local or Atlas).
2. From the **`server/`** directory run:

   ```bash
   node scripts/seed-admin.mjs
   ```

3. The script creates one user with **`role: ADMIN`** and campus **`NIAT HQ (Admin)`**.  
   **Defaults** (override with env vars when you run the command):

   | Variable | Default |
   |----------|---------|
   | `ADMIN_EMAIL` | `admin@niat-insider.local` |
   | `ADMIN_PASSWORD` | `ChangeMe123!` |
   | `ADMIN_NAME` | `NIAT Admin` |

   Example with custom values (PowerShell):

   ```powershell
   $env:ADMIN_EMAIL="you@school.edu"; $env:ADMIN_PASSWORD="YourStrongPass1!"; node scripts/seed-admin.mjs
   ```

4. If an admin with that email **already exists**, the script exits without changing anything.
5. Open the app **Sign in** and log in with that email and password. You should land on **`/admin`**.

**Additional admins:** not built into the UI. For demos, run the seed with a **different** `ADMIN_EMAIL` after the first admin exists, or insert a user in MongoDB with `role: "ADMIN"` and a bcrypt-hashed password (same shape as other users).

### Accounts (summary)

| Role | How the account is created |
|------|----------------------------|
| **Admin** | **Server script only** — see [How to add an admin](#how-to-add-an-admin) above. |
| **Moderator** | An **admin** logs in, opens **Admin**, and uses **Add moderator** (name, email, password, campus). No public registration. |

After login, **admins** go to `/admin` and **moderators** to `/dashboard`.

## Deploy (Vercel + Render)

Typical setup: **API on Render**, **static client on Vercel**.

1. **Render (API)**  
   - Build: `cd server && npm install && npm run build`  
   - Start: `cd server && npm start` (or `node dist/server.js` from `server/`)  
   - Set environment variables to match `server/env.production.example`: **`MONGODB_URI`**, **`JWT_SECRET`**, **`JWT_EXPIRES_IN`**, **`PORT`** (Render often injects `PORT` — use it), **`CORS_ORIGIN`**.  
   - **`CORS_ORIGIN`** must include your **Vercel site origin** exactly (e.g. `https://your-app.vercel.app`). Multiple origins: comma-separated, no spaces.  
   - Optional health check path: **`GET /api/health`** returns `{ "ok": true }` (no database call).

2. **Vercel (client)**  
   - Root should contain `vercel.json` with SPA rewrite to `index.html` (already in this repo).  
   - Set **`VITE_API_BASE_URL`** to your **public Render API URL** (no trailing slash), e.g. `https://your-service.onrender.com`.  
   - Redeploy after changing env vars.

3. **Local vs production API URL**  
   - **`npm run dev`** with **no** `VITE_API_BASE_URL` → client calls **`http://localhost:5000`** (run the API locally on that port).  
   - **`vite build` / Vercel** with **no** `VITE_API_BASE_URL` → client uses the **default Render URL** baked into the app (or set `VITE_API_BASE_URL` on Vercel to your real API URL).  
   - A leftover **`localhost`** value in a production build is **ignored** (replaced by the default deployed URL) unless **`VITE_USE_LOCAL_API=true`**.

## Production-style commands

```bash
cd server && npm run build && npm start
cd client && npm run build && npm run preview
```

Test builds (example: API on port `5001` per `env.test.example`):

```bash
cd server && npm run build && npm run start:test
cd client && npm run build:test
```

## API (summary)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/health` | Public — liveness (Render / uptime) |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Bearer JWT |
| GET | `/api/meta/campuses` | Public — **MongoDB** campus directory (seeded on start; **admins can add schools** by typing a new name when creating a moderator) |
| GET / POST | `/api/admin/moderators` | Bearer JWT, **ADMIN** only — list / create moderators |
| GET | `/api/articles` | Bearer — list scoped to moderator’s **campus** |
| GET | `/api/articles/:id` | Bearer — **403** if article campus ≠ user campus |
| PUT | `/api/articles/:id` | Same — edit `title`, `body`, `category`, optional **`imageUrl`** (https `http`/`https` URL; empty string removes cover) |
| DELETE | `/api/articles/:id` | Same |

**401** — missing/invalid token. **403** — valid token but wrong campus for that article.

The moderator UI shows **cover images** from `imageUrl` (any public image URL). If unset or the URL fails to load, a branded gradient placeholder is shown.

## Project layout

- `server/src` — `config/` (env), `controllers/`, `services/`, `middleware/`, `routes/`, `models/`, `types/`
- `client/src` — `pages/`, `components/`, `hooks/`, `services/`, `constants/`, `types/`

## Git workflow (assignment)

Use feature branches (e.g. `feature/auth-backend`, `feature/moderator-ui`), open PRs into `main`, and use conventional commits (`feat:`, `fix:`, `chore:`, `docs:`).

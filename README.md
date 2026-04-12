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

Open the URL Vite prints (usually `http://localhost:5173`). Log in with a **moderator** user seeded or created via `POST /api/auth/register` (see API below).

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

## Deploy on Render (or similar PaaS)

`.env` files are **not** on the server. Set variables in the host’s **Environment** UI (or secrets).

**Web service settings**

| Setting | Suggested value |
|--------|-------------------|
| **Root Directory** | `server` (if the repo root contains `client/` + `server/`) |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

Use **`npm start`**, not `npm run dev`. `dev` is for local machines; production should use `NODE_ENV=production` and the compiled `dist/` output.

**Required environment variables** (names must match exactly):

| Variable | Example / notes |
|----------|-----------------|
| `PORT` | Render usually sets this automatically. If your host does not, add e.g. `10000`. |
| `MONGODB_URI` | MongoDB Atlas connection string (or other Mongo URL). **Required** — without it the app exits on boot. |
| `JWT_SECRET` | Long random string. |
| `JWT_EXPIRES_IN` | e.g. `7d` or `1d` |
| `CORS_ORIGIN` | Your deployed **frontend** origin, e.g. `https://your-app.onrender.com` or comma-separated list. |

After saving env vars, **redeploy** or restart the service.

## API (summary)

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Bearer JWT |
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

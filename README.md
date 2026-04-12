# NIAT Insider

NIAT Insider is a small internal web app for campus news: **moderators** sign in and work with articles for *their* school only, and **admins** invite moderators and manage which school each person belongs to. Everything sits on a classic **MongoDB + Express API** and a **React (TypeScript)** frontend, with **JWT** auth so sessions stay stateless.

If you’re setting this up for the first time, skim “Run it locally” first, then read “Who can log in and how” so you know how to create the admin and moderators.

---

## What you’ll need

- **Node.js** 20 or newer works well.
- **MongoDB** — either running on your machine (`mongodb://localhost:27017/...`) or a hosted URI such as Atlas.

---

## Get the code and install

```bash
git clone <your-repo-url> niat-insider
cd niat-insider
```

Install dependencies in both folders:

```bash
cd server && npm install && cd ..
cd client && npm install && cd ..
```

---

## Environment variables

Real `.env` files are not committed to git. Copy the example files and rename them:

- **Server (local dev):** copy `server/env.development.example` → `server/.env` and fill in at least `MONGODB_URI`, `JWT_SECRET`, and the rest as in the example.
- **Client (local dev):** copy `client/env.development.example` → `client/.env.development` if you need to override defaults.

There are separate examples for test and production builds (`env.test.example`, `env.production.example`) — same idea: copy and adjust.

**Two values that trip people up:**

- **`CORS_ORIGIN` on the server** must match the exact origin of your React app (scheme + host + port). For Vite locally that’s often `http://localhost:5173`. Multiple origins are fine: comma-separated, no spaces.
- **`VITE_API_BASE_URL` on the client** should be your API root with **no trailing slash**, e.g. `http://localhost:5000`.

After you change client env files, restart the Vite dev server so it picks them up.

---

## Run it locally

**Terminal 1 — API**

```bash
cd server
cp env.development.example .env
# edit .env: MONGODB_URI, JWT_SECRET, etc.
npm run build
npm run dev
```

**Terminal 2 — Client**

```bash
cd client
cp env.development.example .env.development
# optional: set VITE_API_BASE_URL if your API isn’t on the default
npm run dev
```

Open whatever URL Vite prints (usually `http://localhost:5173`).

**Default API URL in dev:** if you don’t set `VITE_API_BASE_URL`, the client assumes the API is at `http://localhost:5000`, which matches the usual local server port.

---

## Who can log in and how

There is **no public registration**. Moderators are created by an admin; the first admin is created **once** on the server with a script (there is no “sign up as admin” page).

### Creating the first admin

1. Make sure `server/.env` exists and `MONGODB_URI` points at a database you can reach.
2. From the `server/` folder, run:

   ```bash
   node scripts/seed-admin.mjs
   ```

3. That creates a user with role **ADMIN**. By default it uses:
   - Email: `admin@niat-insider.local`
   - Password: `ChangeMe123!`
   - Name: `NIAT Admin`

   You can override these when you run the script with `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` in the environment. On Windows PowerShell, for example:

   ```powershell
   $env:ADMIN_EMAIL="you@school.edu"; $env:ADMIN_PASSWORD="YourStrongPass1!"; node scripts/seed-admin.mjs
   ```

4. If an admin with that email already exists, the script does nothing — safe to run again.
5. Sign in through the app; admins are sent to `/admin`.

Extra admin accounts aren’t created in the UI. For another admin you’d run the seed with a different email or insert a user in MongoDB with `role: "ADMIN"` and a bcrypt-hashed password (same general shape as other users).

### Moderators

An admin signs in, opens **Admin**, and uses **Add moderator** (name, email, temporary password, school/campus). Moderators land on `/dashboard` after login and only see content for their campus.

Schools come from MongoDB: there’s a seeded list on startup, and admins can also **type a new school name** when adding a moderator — it gets saved automatically if it’s valid (length limits apply).

---

## Deploying (e.g. Render + Vercel)

A common split is: **API on Render**, **static site on Vercel**.

**On the API host (Render or similar):** build the server (`npm install`, `npm run build`), start with `npm start` or `node dist/server.js` from `server/`, and set the same kinds of variables as in `server/env.production.example` — `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT` (many hosts set `PORT` for you), and especially **`CORS_ORIGIN`** including your real frontend origin, e.g. `https://your-app.vercel.app`.

There’s a simple health check at **`GET /api/health`** that returns JSON like `{ "ok": true }` — useful for uptime checks; it doesn’t hit the database.

**On Vercel:** this repo includes a `vercel.json` that sends all routes to `index.html` so the React router works. Set **`VITE_API_BASE_URL`** to your public API URL (no trailing slash). Redeploy after changing env vars.

**Production build without `VITE_API_BASE_URL`:** the client falls back to a default API URL baked into the code (update that constant if your API lives elsewhere, or set the env var on Vercel). If a production build still has `localhost` in an env file by mistake, the app normally ignores it so you don’t accidentally point production at your laptop — unless you explicitly set `VITE_USE_LOCAL_API=true`.

---

## Production-style commands

```bash
cd server && npm run build && npm start
cd client && npm run build && npm run preview
```

Test-oriented builds can use the `env.test.example` files and the scripts in `package.json` (`start:test`, `build:test`, etc.).

---

## API overview

Rough map of the HTTP API (details live in the code under `server/src`):

- **`GET /api/health`** — public; quick liveness check.
- **`POST /api/auth/login`** — email + password; returns a JWT and user info.
- **`GET /api/auth/me`** — current user; needs `Authorization: Bearer <token>`.
- **`GET /api/meta/campuses`** — list of schools stored in MongoDB (seeded plus any added when inviting moderators).
- **`GET /api/admin/moderators`** / **`POST /api/admin/moderators`** — admin only; list moderators or create one.
- **Articles** under **`/api/articles`** — authenticated; moderators only see and edit articles for their own campus. Wrong campus → **403**. Missing or bad token → **401**.

Article bodies support an optional **`imageUrl`** for a cover image (public `http`/`https` URL). If it’s missing or broken, the UI shows a gradient placeholder.

---

## Where things live in the repo

- **`server/src`** — Express app: config, routes, controllers, services, middleware, Mongoose models, TypeScript types.
- **`client/src`** — React app: pages, components, API helpers, auth context, etc.

---

## Git habits (for coursework or teams)

Feature branches (e.g. `feature/auth-backend`), pull requests into `main`, and conventional commits (`feat:`, `fix:`, `chore:`, `docs:`) keep history readable for you and reviewers.

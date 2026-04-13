# NIAT Insider

NIAT Insider is a simple internal platform for managing campus news.  
It allows **moderators** to log in and manage articles for their own campus, while **admins** handle moderator accounts and campus assignments.

The project is built using:
- MongoDB (database)
- Express + Node.js (backend API)
- React + TypeScript (frontend)
- JWT for authentication

---

##  Requirements

Before running the project, make sure you have:

- **Node.js** (v20 or newer recommended)
- **MongoDB** (local or cloud, e.g. MongoDB Atlas)

---

##  Setup

Clone the repository:

```bash
git clone <your-repo-url>
cd niat-insider

Install dependencies for both backend and frontend:

cd server && npm install
cd ../client && npm install
## Environment Setup

Environment variables are not included in the repo.

Server

Copy the example file:

cp server/env.development.example server/.env

Edit .env and update:

MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
PORT=5000
CORS_ORIGIN=http://localhost:5173
Client

Copy the example file:

cp client/env.development.example client/.env.development

Set API base URL:

VITE_API_BASE_URL=http://localhost:5000

After changing client env files, restart the dev server.

## Running the Project
Start backend
cd server
npm run build
npm run dev
Start frontend
cd client
npm run dev

Open the app at:

http://localhost:5173

## Authentication & Roles

There is no public registration.

Admin

Admins are created manually using a script.

Run this once:

cd server
node scripts/seed-admin.mjs

Default credentials:

Email: admin@gmail.com
Password: ChangeMe123!

for Moderator:
Email: umesh@gmail.com
Password: 12345678


You can override them using environment variables.

Moderator

Admins can:

log in
go to Admin panel
create moderators

Moderators:

log in
go to dashboard
see only their campus articles
## Security (RBAC)

Each moderator is restricted to their campus.

They can:

    view their campus articles
    edit their campus articles
    cannot access other campuses (returns 403)
    API Overview
Auth
POST /api/auth/login
GET /api/auth/me
Articles
GET /api/articles
GET /api/articles/:id
PUT /api/articles/:id
DELETE /api/articles/:id
Other
GET /api/health
GET /api/meta/campuses
GET /api/admin/moderators (admin only)
POST /api/admin/moderators (admin only)
## Article Images

Articles can include an optional imageUrl.

Must be a valid public URL (http or https)
If missing or broken, a placeholder is shown
## Deployment (Basic Idea)

Typical setup:

Backend → Render
Frontend → Vercel

Important:

Set correct CORS_ORIGIN on backend
Set correct VITE_API_BASE_URL on frontend

Health check:

GET /api/health
## Project Structure
Backend (server/src)
config → environment setup
controllers → handle requests
services → business logic
models → database schemas
routes → API routes
middleware → auth & security
Frontend (client/src)
pages → login, dashboard
components → UI elements
services → API calls
hooks → reusable logic
types → TypeScript types
## Production Commands
cd server && npm run build && npm start
cd client && npm run build && npm run preview
## Git Workflow
Work on feature branches:
feature/auth-backend
feature/article-api
feature/moderator-ui
Create Pull Requests
Merge into main

Use clear commit messages:

feat: add login functionality
fix: handle invalid token

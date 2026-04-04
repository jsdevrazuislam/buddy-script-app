# Buddy Script — Full-Stack Social Hub

[![Backend](https://img.shields.io/badge/Backend-Live-brightgreen)](https://buddy-script-app.onrender.com)
[![Frontend](https://img.shields.io/badge/Frontend-Live-brightgreen)](https://buddy-script-app.vercel.app)
[![API Docs](https://img.shields.io/badge/API%20Docs-Swagger-blue)](https://buddy-script-app.onrender.com/api-docs)

Buddy Script is a production-grade, real-time social media platform built with a fully decoupled backend and frontend architecture. It features a live activity feed, engagement systems (likes/comments/replies), WebSocket-based real-time updates, Redis-backed rate limiting, and Cloudinary image hosting.

---

## 🌐 Deployment URLs

| Service | URL |
|---|---|
| **Frontend** | https://buddy-script-app.vercel.app |
| **Backend API** | https://buddy-script-app.onrender.com |
| **API Documentation** | https://buddy-script-app.onrender.com/api-docs |
| **Health Check** | https://buddy-script-app.onrender.com/health |

---

## 📂 Project Structure

```
.
├── client/          # Next.js 16 frontend (deployed on Vercel)
├── server/          # Node.js/Express backend (deployed on Render)
├── docker-compose.yml  # Full-stack local orchestration
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js** v20+
- **Docker** (for PostgreSQL + Redis)
- A **Cloudinary** account (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/jsdevrazuislam/buddy-script-app
cd buddy-script-app

# Install all workspace dependencies
npm install          # root hooks
cd client && npm install
cd ../server && npm install
```

### 2. Configure Environment Variables

#### Backend — `server/.env`

Copy from the example file and fill in your values:

```bash
cp server/.env.example server/.env
```

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `9000` |
| `NODE_ENV` | Environment (`development` / `production`) | `development` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASS` | PostgreSQL password | `postgres` |
| `DB_NAME` | Database name | `social_feed` |
| `DB_SYNC_ALTER` | Auto-alter schema in dev (`true`/`false`) | `false` |
| `REDIS_HOST` | Redis hostname | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password (blank if none) | _(empty)_ |
| `JWT_ACCESS_SECRET` | **Secret** for signing access tokens | _(strong random string)_ |
| `JWT_REFRESH_SECRET` | **Secret** for signing refresh tokens | _(strong random string)_ |
| `JWT_ACCESS_EXPIRY` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token TTL | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your_api_secret` |
| `CLIENT_URL` | Frontend origin (for CORS) | `http://localhost:3000` |

> **⚠️ Production:** `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `DB_HOST`, and `REDIS_HOST` are **required** — the server will refuse to start if they are missing.

#### Frontend — `client/.env.local`

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:9000/api/v1` |
| `NEXT_PUBLIC_SOCKET_URL` | WebSocket server URL | `http://localhost:9000` |

### 3. Start Services (with Docker)

```bash
# Spin up PostgreSQL + Redis in background
docker-compose up db redis -d

# Start backend dev server
cd server && npm run dev   # http://localhost:9000

# Start frontend dev server (new terminal)
cd client && npm run dev   # http://localhost:3000
```

---

## 🐳 Full Docker Deployment

Run the entire stack (DB + Redis + API + Frontend) in containers:

```bash
docker-compose up --build
```

| Service | Port | Description |
|---|---|---|
| `db` | `5432` | PostgreSQL 15 |
| `redis` | `6379` | Redis 7 |
| `server` | `9000` | Node.js API server |
| `client` | `3000` | Next.js production build |

---

## 🔧 Available Scripts

### Backend (`server/`)

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot-reload (nodemon) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm run start` | Run compiled production build |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run format` | Prettier formatting |
| `npm run type-check` | TypeScript type-check (no emit) |

### Frontend (`client/`)

| Command | Description |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint check |

---

## 📖 API Documentation

Interactive Swagger/OpenAPI docs are available when the server is running:

- **Local**: http://localhost:9000/api-docs
- **Production**: https://buddy-script-app.onrender.com/api-docs

### Endpoints Summary

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | ❌ | Register new user |
| `POST` | `/api/v1/auth/login` | ❌ | Login, get tokens |
| `POST` | `/api/v1/auth/refresh` | ❌ | Refresh access token |
| `POST` | `/api/v1/auth/logout` | ❌ | Revoke refresh token |
| `GET` | `/api/v1/posts` | ✅ | Get paginated feed |
| `POST` | `/api/v1/posts` | ✅ | Create a post |
| `GET` | `/api/v1/posts/:id` | ✅ | Get post by ID |
| `GET` | `/api/v1/posts/upload-url` | ✅ | Get Cloudinary signed upload URL |
| `POST` | `/api/v1/likes/toggle` | ✅ | Toggle like on post/comment |
| `GET` | `/api/v1/likes` | ✅ | Get likers |
| `POST` | `/api/v1/comments` | ✅ | Create comment |
| `POST` | `/api/v1/comments/:id/replies` | ✅ | Reply to comment |
| `GET` | `/api/v1/comments/post/:postId` | ✅ | Get post comments |

---

## 🛡️ Security Architecture

| Feature | Implementation |
|---|---|
| **Rate Limiting** | Redis-backed `rate-limiter-flexible` — per IP + User ID |
| Auth routes | 10 requests / 15 min → 30 min block |
| Post creation | 20 posts / hour → 1 hour block |
| Likes / Comments | 100 requests / min → 5 min block |
| **Helmet.js** | Strict CSP, hides `X-Powered-By`, sets security headers |
| **CORS** | Whitelist-only: `https://buddy-script-app.vercel.app` in production |
| **XSS Protection** | `xss-clean` strips malicious HTML from all request inputs |
| **HPP** | `hpp` prevents HTTP parameter pollution attacks |
| **Body Size Limit** | `express.json({ limit: '10kb' })` prevents JSON bomb attacks |
| **Image Upload** | 5 MB max enforced via Cloudinary signed params + Content-Length header |
| **JWT** | Short-lived access tokens (15m) + refresh tokens in Redis; secrets validated at startup |
| **SQL Injection** | Sequelize parameterized queries (no raw string interpolation) |
| **Stack Traces** | Hidden in production — error handler strips stack from API responses |
| **WebSocket Auth** | JWT verified on every Socket.IO connection |

---

## ⚡ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 18+, TypeScript |
| **Framework** | Express 5 |
| **Database** | PostgreSQL 15 via Sequelize ORM |
| **Cache / Queue** | Redis 7 via ioredis + BullMQ |
| **Real-Time** | Socket.IO 4 with Redis adapter (horizontal scale) |
| **Auth** | JWT (access + refresh token rotation) |
| **Image Uploads** | Cloudinary (signed URL — direct browser upload) |
| **Validation** | Zod schemas |
| **Logging** | Winston (structured logs to file + console) |
| **HTTP Security** | Helmet, cors, xss-clean, hpp, rate-limiter-flexible |
| **API Docs** | Swagger / OpenAPI 3.0 |
| **Frontend** | Next.js 16, React 19, TanStack Query |
| **Deployment** | Render (backend), Vercel (frontend) |

---

## 🛡 License

This project is licensed under the ISC License.


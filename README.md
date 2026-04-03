# Buddy Script - Full Stack Social Hub

Buddy Script is a production-grade social media platform featuring a modern feed, engagement systems (likes/comments), and real-time interactions. The application is built with a separate backend and frontend architecture for maximum scalability.

---

## 📂 Project Structure

- **`client/`**: [Next.js](https://nextjs.org) frontend application for a fast and responsive user experience.
- **`server/`**: [Node.js](https://nodejs.org) backend API built with Express, Sequelize (PostgreSQL), and Redis.
- **`old-code/`**: Legacy HTML/CSS templates providing the original design reference.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+
- **Docker**: For running PostgreSQL and Redis locally.
- **Cloudinary**: For hosting user images.

### 1. Install Dependencies
Run the following in the root directory to install all necessary packages:
```bash
npm install                     # Root level hooks
cd client && npm install        # Frontend
cd ../server && npm install     # Backend
```

### 2. Environment Configuration
Create environmental files in both subdirectories:

**Backend (`server/.env`)**:
- `DB_URL`: Your PostgreSQL connection string.
- `REDIS_URL`: Your Redis connection string.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Your Cloudinary credentials.

**Frontend (`client/.env.local`)**:
- `NEXT_PUBLIC_API_URL`: Set to `http://localhost:9000/api/v1` for local development.

### 3. Run Development Servers
Start the backend and frontend in separate terminals:

**Backend**:
```bash
cd server
npm run dev # Access API at http://localhost:9000
```

**Frontend**:
```bash
cd client
npm run dev # View App at http://localhost:3000
```

---

## 🐳 Docker Deployment

The application is containerized for easy deployment. Use the root `docker-compose.yml` to orchestrate all services:

```bash
docker-compose up --build
```

**Services included:**
- **PostgreSQL**: Primary database.
- **Redis**: Caching and background job queue.
- **API Server**: Node.js backend.
- **Client**: Next.js optimized production build.

---

## 🛠 Tech Stack Highlights

- **Frontend**: Next.js 16, React 19.2, Bootstrap (for some components), Polished UI patterns.
- **Backend API**: Typescript, Express, Sequelize ORM.
- **Performance**: Cursor-based pagination for feeds, Redis caching for tokens and frequent data.
- **Storage**: Direct-to-Cloudinary image uploads using signed URLs for security.
- **Documentation**: Fully documented REST API via **Swagger/OpenAPI** (`/api-docs`).

---

## 🛡 License
This project is licensed under the ISC License.

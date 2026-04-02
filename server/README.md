# Social Feed Backend API

This is the backend implementation for a production-grade social feed application, built with Node.js, Express, PostgreSQL, Redis, and Cloudinary.

## System Architecture

The application follows a **Monolithic Modular Architecture**:
- **Auth Module**: JWT, Refresh tokens (stored in Redis).
- **Post Module**: Feed generation with Cursor-based pagination and Redis caching.
- **Engagement Module**: Polymorphic Likes and Nested Comments.

## Tech Stack
- **Backend:** Node.js, Express.js (Typescript)
- **Database:** PostgreSQL with Sequelize ORM
- **Cache & Storage:** Redis for tokens/caching, Cloudinary (via Signed URLs) for images.
- **Validation:** Zod
- **Documentation:** Swagger/OpenAPI

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose (for DB & Redis)
- Cloudinary Account (for image uploads)

### 1. Environment Variables
Copy `.env.example` to `.env` and fill in your Cloudinary details:
```bash
cp .env.example .env
```

### 2. Start Database & Redis
Start PostgreSQL and Redis using Docker Compose:
```bash
docker-compose up -d
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Server
For development (with automatic model syncing and nodemon):
```bash
npm run dev
```

For production (build and run):
```bash
npm run build
npm start
```

## API Documentation
Once the server is running, visit the Swagger UI for complete API documentation and testing:
**[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

## Key Features & Scaling Logic
- **Cursor Pagination**: Used for the feed endpoint (`GET /api/v1/posts`) to prevent offset scaling issues.
- **Polymorphic Likes**: A single `likes` table stores likes for `POST`, `COMMENT`, and `REPLY` entity types, optimizing query performance with composite unique indexes.
- **Signed URL Uploads**: The application never touches the binary image file directly. It generates a signed URL using `GET /api/v1/posts/upload-url`, and the Frontend securely uploads the file directly to Cloudinary.
- **Fully Stateless**: Session management leverages JWTs and Redis, allowing you to easily scale horizontally with automated deployment workflows.

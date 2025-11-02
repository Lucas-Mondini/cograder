# Image Processing App

Full-stack image processing application with React frontend and Node.js backend using Redis queues.

## Prerequisites

- Docker & Docker Compose
- Firebase service account credentials

## Setup

1. **Configure environment**

Copy `.env.example` to `.env` and fill in your credentials:

```bash
# Required
REDIS_PASSWORD=your_redis_password
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your-bucket-name

# Optional (defaults shown)
VITE_API_URL=http://localhost:8000
API_URL=http://api:8000
APP_ENV=development
```

2. **Run with Docker Compose**

```bash
# Start all services
docker-compose up

# Or run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Access

- **Frontend:** http://localhost
- **API:** http://localhost:8000
- **API Docs:** http://localhost:8000/api-docs

## Rebuild After Changes

```bash
# Rebuild and restart
docker-compose up --build

# Rebuild specific service
docker-compose up --build api
docker-compose up --build app
```

## Architecture

```
├── api/          # Node.js + TypeScript backend
│   ├── app/      # Controllers, routes, services
│   ├── infrastructure/  # Redis, queues, workers
│   ├── config/   # Settings
│   └── core/     # HTTP server, types
└── app/          # React + TypeScript + Vite frontend
```

## API Endpoints

- `GET /health` - Health check
- `GET /api-docs` - SwaggerUI
- `POST /jobs` - Create image processing job
- `GET /jobs` - list all job status
- `GET /jobs/:id` - Get job status
- WebSocket at `/ws/` for real-time updates
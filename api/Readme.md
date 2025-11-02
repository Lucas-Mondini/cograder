# Project Structure

This project follows a **Layered Architecture** with separation between business logic and technical implementation.

## Directory Overview

```
src/
├── app/
├── infrastructure/
├── config/
├── core/
└── index.ts
```

## Folders Explanation

### `app/`
**Application layer** - Business logic and application flow

- `controllers/` - Handle HTTP requests, validate input, call services
- `routes/` - Define API endpoints and map to controllers
- `services/` - Business logic orchestration
- `middlewares/` - Request interceptors (auth, validation, logging)

**Purpose**: What the application does (business rules)

---

### `infrastructure/`
**Infrastructure layer** - Technical implementations that can be replaced

- `database/` - Database connections (Redis, PostgreSQL, etc.)
- `queue/` - Queue implementations (BullMQ, RabbitMQ, etc.)
- `workers/` - Background job processors
- `websocket/` - WebSocket server implementations

**Purpose**: How the application does it (technical details)

---

### `config/`
**Configuration layer** - Static configurations and environment variables

- Environment settings
- Third-party service configurations (Swagger, etc.)
- Application constants

**Purpose**: Application settings and constants

---

### `core/`
**Core layer** - Fundamental shared code

- `http/` - Base HTTP/Express server setup
- `types/` - TypeScript types and interfaces used across the app

**Purpose**: Foundation that other layers depend on

---

## Architecture Principles

### Separation of Concerns
- **app/** knows *what* to do (business logic)
- **infrastructure/** knows *how* to do it (technical implementation)
- **core/** provides the foundation
- **config/** provides the settings

### Dependency Flow
```
app/ → infrastructure/ → core/
  ↓
config/
```

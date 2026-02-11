# Backend Task

## Distributed State Synchronization Service

Build a minimal backend service where multiple participants can collaborate on a shared JSON document in real-time. The service should handle multiple rooms, maintain consistency across participants and backend instances, and support conflict-free updates using CRDTs (e.g., Yjs or Automerge).

## Swagger API

Swagger UI is available at:

```text
http://localhost:3000/docs
```

Note:

- **Global prefix**: `/api`
- **API versioning**: `/v1`

## Prerequisites

- **pnpm**: Install pnpm globally.

## How to run

### 1) Install pnpm

```bash
npm i -g pnpm
```

### 2) Install dependencies

```bash
pnpm install
```

### 3) Start the server

```bash
pnpm start
```

## How to test

### REST (HTTP)

- **Swagger UI**

  Open `http://localhost:3000/docs` and try the endpoints.

- **Collaboration test page (HTML)**

  Open:

  ```text
  http://localhost:3000/api/v1/collab/test
  ```

  This page connects to the Socket.IO namespace and lets you join a room and edit shared JSON.

- **Metrics**

  ```bash
  curl "http://localhost:3000/api/v1/metrics"
  curl "http://localhost:3000/api/v1/metrics?roomId=demo"
  ```

### WebSocket (Socket.IO)

- **Namespace**: `/ws`

Easiest way to test WebSocket is the built-in HTML page:

```text
http://localhost:3000/api/v1/collab/test
```

### Multiple instances (2 terminals)

If you want to run multiple backend instances locally:

1. Open a **second terminal**

2. In `.env`, change `PORT` and `INSTANCE_ID` for the second instance (example):

```text
PORT=3001
INSTANCE_ID=instance-b
```

3. Run in the second terminal:

```bash
pnpm start
```

Both instances should point to the **same Redis** (`REDIS_HOST`, `REDIS_PORT`) so updates can sync across instances.
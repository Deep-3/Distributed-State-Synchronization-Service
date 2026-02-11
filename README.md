# Backend Task

## Distributed State Synchronization Service

Build a minimal backend service where multiple participants can collaborate on a shared JSON document in real-time. The service should handle multiple rooms, maintain consistency across participants and backend instances, and support conflict-free updates using CRDTs (e.g., Yjs or Automerge).

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
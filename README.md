# Solstice — Full-Stack B2B Revenue Workspace
**Target role:** Remote TypeScript full-stack developer (React, Node.js, NestJS, REST, PostgreSQL, TypeORM, Docker, Jest, Vitest, CI/CD).

A multi-stage opportunity dashboard built with a React SPA and a NestJS REST API. Users create B2B deals, move them through validated stages, and inspect a live pipeline value summary. Every stage transition creates an audit record in the same transaction.

## Architecture
```text
React 19 + Vite + TypeScript (5173)
             |
             | REST + demo X-API-Key
             v
NestJS 11 HTTP API (8093)  -> PostgreSQL 17
             |
       Validation, transactional stage transitions, audit records
```

- **Frontend:** React hooks, typed fetch client, accessible controlled inputs, stage board, filter, KPI dashboard.
- **Backend:** NestJS modules, global validation, DTOs, API-key guard, TypeORM entity model, domain state rules, optimistic version-aware stage update, transactional audit log.
- **Data:** Paginated opportunity history, status counts, pipeline value and probability-weighted forecast.
- **Delivery:** Docker Compose, unit tests and GitHub Actions for frontend and backend.

## Start database + backend
```bash
cp .env.example .env
# replace the passwords in .env
docker compose --env-file .env up --build
```
API health: `http://localhost:8093/health`.

## Start frontend
```bash
cd apps/web
npm install
npm run dev
```
Visit `http://localhost:5173`.

## Sample REST calls
```bash
curl -H 'X-API-Key: local-development-key' http://localhost:8093/v1/opportunities
curl -X POST http://localhost:8093/v1/opportunities \
 -H 'Content-Type: application/json' -H 'X-API-Key: local-development-key' \
 -d '{"company":"Blue Atlas","valueCents":1900000,"probability":50}'
```

## Tests
```bash
cd apps/api && npm install && npm test && npm run build
cd ../web && npm install && npm test && npm run build
```

## Deployment constraints
The default API key is a **local demonstration fixture** only. Do not deploy it publicly. Replace with OIDC + tenant authorization, use proper secret management and CORS configuration, create TypeORM migrations and disable `synchronize` for persistent environments. CI tests are domain tests, not a claim of an end-to-end deployed system.

# TestMatrix — Browser Automation for Solstice

Playwright/Chromium browser tests against the existing React revenue workspace.
An isolated HTTP fixture mocks the public API contract so this suite can run
without an API server, database credentials or internet services.

## Running

From the repository root:

```bash
cd apps/web && npm install
cd ../../qa && npm install
npx playwright install chromium
npm run test:e2e
```

The runner starts the real Vite frontend on port 5173. Tests cover opportunity
creation, KPI forecast, stage transitions, browser-side form validation and
recoverable backend errors. The fixture is scoped to the API and uses synthetic
customer names.

**Boundary:** These are browser+HTTP contract tests, not end-to-end PostgreSQL
tests. Live API, concurrency, authorization and real deployment checks should
be tested separately. Selenium and Azure DevOps are not claimed here.

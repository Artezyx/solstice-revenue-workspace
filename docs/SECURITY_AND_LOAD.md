# JWT security and bounded load verification

The NestJS guard now validates HS256 JWT signature, expiration, issuer,
audience and `sub` claim. GET requires `opportunities:read` (or write);
POST/PATCH requires `opportunities:write`. Missing/invalid tokens are
rejected (401), insufficient scopes are rejected (403).

Set `SOLSTICE_JWT_SECRET` to a random 32+ byte value. The issuer defaults
to `solstice-local` and audience to `solstice-api` in the local demo.
The React app no longer embeds an API key; users paste a short-lived token
in the sign-in panel. Tokens are held in memory and cleared on sign-out.

For production: managed OAuth2/OIDC with PKCE, asymmetric keys and JWKS
rotation, HTTPS, proper session lifecycle, database migrations, field-level
or tenant-level authorization, CSP and audit logging are still required.
TypeORM synchronize is disabled when NODE_ENV=production, but migrations
must be authored before any persistent deployment.

`npm test` in apps/api includes negative JWT and scope tests. Browser QA
still mocks the backend; it verifies UI behavior, not cryptographic tokens.

For local smoke load on a disposable stack:
```sh
JWT="<short-lived-test-token>" BASE_URL=http://localhost:8093 k6 run load/opportunity-reads.js
```
10 VUs for 30 seconds and p95 under 800 ms are initial thresholds, not
measured results. Preserve real measurements in your benchmark report.

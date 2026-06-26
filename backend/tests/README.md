# Backend tests

## Purpose

This directory contains backend-focused tests.

The current backend test layer is intentionally small and currently smoke-test oriented. It verifies that a running backend instance exposes the expected health behavior through HTTP.

These tests are not unit tests yet. They are integration-style smoke tests against a running backend process.

## Current test suites

### Health smoke test

`backend/tests/smoke/health.mjs`

The health smoke test checks the backend health endpoints:

| Endpoint                  | Expected status | Purpose                               |
| ------------------------- | --------------- | ------------------------------------- |
| `/api/health/runtime`     | `200`           | Runtime health is reachable           |
| `/api/health/persistence` | `200`           | Persistence is configured and healthy |
| `/api/health`             | `200`           | Overall backend readiness is healthy  |

The test validates selected response fields instead of only checking HTTP status codes.

#### Running tests

Run the backend smoke test with:

```bash
npm run test:backend:smoke
```

Run the normal repository check with:

```bash
npm run check
```

`npm run check` currently validates formatting and linting. It does not currently run the backend smoke test automatically.

#### Required backend state

The smoke test expects a backend server to already be running.

Default API base URL:

```txt
http://localhost:3000
```

Override it with:

```bash
API_BASE_URL=http://localhost:3000 npm run test:backend:smoke
```

The backend must be started with valid config for the smoke test to pass successfully:

```txt
NODE_ENV
DB_PATH
SQLITE_JOURNAL_MODE
```

Persistence must be healthy for the current smoke test to pass.

#### Retry behavior

The smoke test retries each endpoint to allow the backend a short startup window.

Environment variables:

| Variable         | Default                 | Purpose                            |
| ---------------- | ----------------------- | ---------------------------------- |
| `API_BASE_URL`   | `http://localhost:3000` | Backend API base URL               |
| `SMOKE_RETRIES`  | 10                      | Number of attempts per endpoint    |
| `SMOKE_DELAY_MS` | 1000                    | Delay between retry attempts in ms |

Example:

```bash
SMOKE_RETRIES=20 SMOKE_DELAY_MS=500 npm run test:backend:smoke
```

## Test ownership rules

Backend tests should verify observable backend behavior.

### Smoke tests

Smoke tests may verify:

- HTTP status codes
- response JSON shape
- required response fields
- basic cross-module integration
- startup and readiness behavior

Smoke tests should not duplicate implementation details from modules.

### Unit tests

Unit tests, when added, should live close to the module they test or follow a clearly documented test structure.

## Adding backend tests

When adding a backend feature, prefer adding tests at the lowest useful level.

| Test type        | Use when                                                         |
| ---------------- | ---------------------------------------------------------------- |
| Unit test        | Pure function or isolated module behavior can be tested directly |
| Integration test | Multiple backend modules must work together                      |
| Smoke test       | Running backend must expose expected external behavior           |

For API-visible behavior, include at least one smoke or integration test that proves the public contract.

## Known limitations

Current backend tests only cover healthy health endpoint behavior.

They do not yet cover:

- unhealthy persistence responses
- missing config startup failure
- invalid persistence config
- route behavior with unexpected query values
- database read / write behavior
- authentication

These gaps are expected at the current project stage.

Add coverage incrementally as those modules become real.

## Validation before PR

Before opening or updating a backend-related PR, run:

```bash
npm run check
npm run test:backend:smoke
```

For changes that affect config, persistence, or health behavior, also test at least one failure case manually.

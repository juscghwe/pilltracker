# Backend Health Module

## Purpose

This module builds backend health objects for runtime checks, persistence checks, dev-notes checks
and overall application readiness.

It separates process reachability from application readiness so callers can distinguish:

- the backend process is running
- required subsystems are usable
- optional subsystems are disabled, healthy or unhealthy
- the application is ready to serve real work

HTTP routes may expose these health objects, but this module does not own routing, HTTP status
codes, request query parsing, response timestamps or frontend display behavior.

## Health model

| Layer              | Meaning                                                                | Public entrypoint            |
| ------------------ | ---------------------------------------------------------------------- | ---------------------------- |
| Runtime health     | Backend process is reachable and can report process facts.             | `getRuntimeHealth()`         |
| Persistence health | Main persistence config and SQLite access are valid.                   | `getPersistenceHealth()`     |
| Dev-notes health   | Dev-notes subsystem and enabled storage targets are usable.            | `getBackendDevNotesHealth()` |
| Health summary     | Backend application readiness across required and optional subsystems. | `getHealthSummary()`         |

Runtime health alone does not mean the backend is ready.

A backend can be reachable while still reporting unhealthy application readiness when a required
subsystem fails or when an enabled optional subsystem is misconfigured.

## Status model

Backend-wide readiness currently uses:

```js
"healthy" | "unhealthy";
```

Dev-notes subsystem health additionally supports:

```js
"disabled";
```

because dev-notes is an optional feature. Disabled dev-notes should not make the backend unhealthy.

## Public entrypoints

### Runtime health `getRuntimeHealth()`

```js
import { getRuntimeHealth } from "./runtime.js";
```

Returns process-local runtime health.

> [!Warning]
>
> Runtime health currently reports basic Node.js process reachability and process facts. It does not
> validate persistence, scheduler state, notification state, dev-notes storage or other application
> subsystems.

Current shape:

```js
{
    status: "healthy",
    nodeVersion: string,
    platform: string,
    architecture: string,
    uptimeSeconds: number,
}
```

Runtime health currently reports whether the Node.js backend process can respond and provide runtime
facts.

It does not validate persistence, scheduler state, notification state, or other application
subsystems.

### Persistence health `getPersistenceHealth()` & `getPersistenceHealthPartial()`

```js
import { getPersistenceHealth, getPersistenceHealthPartial } from "./persistence.js";
```

`getPersistenceHealth()` returns persistence health for API-facing responses.

By default, it returns a reduced health object:

```js
{
  status: "healthy" | "unhealthy",
  adapter: object,
  engine: object | undefined,
  path: {
    isConfigured: boolean,
  },
}
```

Passing `includeDetails: true` returns the full persistence adapter health result:

```js
getPersistenceHealth({ includeDetails: true });
```

Use the detailed result for diagnostic endpoints or local troubleshooting.

Use the reduced result when callers only need stable public health fields.

`getPersistenceHealthPartial()` returns the smaller shape used by the health summary:

```js
{
  status: "healthy" | "unhealthy",
  path: {
    isConfigured: boolean,
  },
}
```

### Health summary `getHealthSummary()`

```js
import { getHealthSummary } from "./summary.js";
```

`getHealthSummary()` returns backend-wide application readiness.

Current shape:

```js
{
  status: "healthy" | "unhealthy",
  service: "pilltracker-api",
  environment: string,
  checks: {
    runtime: {
      status: "healthy" | "unhealthy",
      uptimeSeconds: number,
    },
    persistence: {
      status: "healthy" | "unhealthy",
      path: {
        isConfigured: boolean,
      },
    },
    devNotes: {
      status: "healthy" | "unhealthy" | "disabled",
      enabled: boolean,
    },
  },
}
```

The summary is healthy only when required checks are healthy and enabled optional checks are not
unhealthy.

Current readiness rule:

```txt
overall healthy =
  runtime health is healthy
  and persistence health is healthy
  and dev-notes health is not unhealthy

overall unhealthy =
  runtime health is unhealthy
  or persistence health is unhealthy
  or dev-notes health is unhealthy
```

Current checks:

- runtime
- persistence
- dev-notes

Dev-notes may report `disabled` without making the backend unhealthy.

## Runtime behavior

The health module should build plain JavaScript health objects.

It should not:

- start and stop services
- mutate application state
- decide HTTP status codes
- add response timestamps
- read request query parameters directly

Those concerns belong to route modules, subsystem modules or concrete adapters.

## Readiness policy

Runtime health is a reachability check.

Persistence health is a subsystem readiness check.

Dev-notes health is an optional subsystem readiness check.

Health summary is the backend readiness check.

Current readiness rule:

```txt
runtime unhealthy      -> backend unhealthy
persistence unhealthy  -> backend unhealthy
dev-notes unhealthy    -> backend unhealthy
dev-notes disabled     -> backend may still be healthy
```

This allows the backend to start and report useful diagnostics even when persistence config is
missing or SQLite access fails or an optional subsystem is disabled.

## Ownership rules

Runtime health owns process-local runtime facts.

Persistence health owns the health contract between health reporting and the active persistence
adapter.

Dev-notes health owns the health contract between backend health reporting and the dev-notes
subsystem.

Health summary owns aggregation of required subsystem health.

Concrete persistence checks belong to the active persistence adapter, not the health summary.

Concrete dev-notes storage checks belong to dev-notes storage adapters and dev-notes subsystem
health, not backend health aggregation.

HTTP response behavior belongs to the route module, not this module.

## Adding new health checks

When adding a new required subsystem, update:

- the subsystem health module or adapter
- `getHealthSummary()`
- the health summary shape in this README
- backend smoke tests
- route documentation if the new check changes API-visible output

New required checks should fail closed.

If the check cannot prove the subsystem is healthy, it should report unhealthy.

When adding a new optional subsystem, document:

- whether `disabled` is a valid non-failing state
- whether an unhealthy enabled subsystem should fail backend readiness
- which module owns concrete health checks
- which module exposes backend-facing health summaries

## Testing

Health behavior is currently expected to be covered through backend health smoke tests.

Run:

```bash
npm run check
npm run test:backend:smoke
```

When changing health summary behavior, test:

- healthy backend configuration
- broken required subsystem configuration
- disabled optional subsystem configuration
- unhealthy enabled optional subsystem configuration

At minimum, persistence failure should keep runtime health reachable while making overall backend
readiness unhealthy.

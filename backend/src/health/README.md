# Backend Health Module

## Purpose

This module binds backend health objects for runtime checks, persistence checks and overall application readiness.

It separates process reachability from application readiness so callers can distinguish:

- the bakcned process is running
- required subsystems are usable
- the application is ready to serve real work

HTTP routes may expose these health objects but this module does not own routing, HTTP status codes or response timestamps.

## Health model

Health is reported in layers:

| Layer              | Meaning                                                   | Public entrypoint        |
| ------------------ | --------------------------------------------------------- | ------------------------ |
| Runtime health     | Backend process is reachable and can report project facts | `getRuntimeHealth()`     |
| Persistence health | Persistence config and SQLite access are valid            | `getPersistenceHealth()` |
| Health summary     | Backend application readiness across required subsystems  | `getHealthSummary()`     |

Runtime health alone does not mean the backend is ready.

A backend can be reachable while still reporting unhealthy application readiness when a required subsystem fails.

## Public entrypoints

### Runtime health `getRuntimeHealth()`

```js
import { getRuntimeHealth } from "./runtime.js";
```

Returns process-local runtime health.

> [!Warning]
>
> Currently the status for Runtime health is hardcoded and will always return `"healthy"`. This will be swapped agains dynamic queries in the near future.

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

Runtime health currently reports whether the Node.js backend process can respond and provide runtime facts.

It does not validate persistence, scheduler state, notification state, or other application subsystems.

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
    },
}
```

The summary is healthy only when all required subsystem checks are healthy.

Current required checks:

- runtime
- persistence

If any required check is unhealthy, the summary must be unhealthy.

## Runtime behavior

The health module should build plain JavaScript health objects.

It should not:

- start and stop services
- mutate application state
- decide HTTP status codes
- add response timestamps
- read request query parameters directly

Those concerns belong to the route layer.

## Readiness policy

Runtime health is a reachability check.\
Persistence health is a subsystem readiness check.\
Health summary is the backend readiness check.

Current readiness rule:
```
overall healthy = healthy only if runtime health and persistence health are healthy
overall unhealthy = at least one subsystem is unhealthy
```

This allows the backend to start and report useful diagnostics even when persistence config is missing or SQLite access fails.

## Ownership rules

Runtime health own process-local runtime facts.

Persistence health owns the health contract between health reporting and the active persistence adapter.

Health summary owns aggregation of required subsystem health.

Concrete persistence checks belong to the active persistence adapter, not this module.

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

## Testing

Health behavior is currently coverered through backened health smoke tests.

Run:

```bash
npm run check
npm run test:backend:smoke
```

When changing health summary behavior, test both:

- healthy backend configuration
- broken subsystem configuration

At minimum, persistence failure should keep runtime health reachable while making overall backend readiness unhealthy.

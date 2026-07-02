# Backend routes module

## Purpose

This module defines backend API routes and maps route-level HTTP behavior to backend modules.

It owns:

- Express router composition
- API path structure
- HTTP status mapping
- request query handling
- API response timestamps

It does not own business logic, health check implementation, persistence checks or frontend display
behavior.

## Public entrypoints

### Root API router

```js
import router from "./routes/index.js";
```

The root API router is mounted below `/api` by the backend app.

Current mounted route groups:

Current mounted route groups:

| Mount path   | Router           | Purpose                          | Mount condition                        |
| ------------ | ---------------- | -------------------------------- | -------------------------------------- |
| `/health`    | `healthRouter`   | Backend health endpoints         | Always mounted                         |
| `/dev-notes` | `devNotesRouter` | CRUD proof slice and experiments | Mounted only when dev-notes is enabled |

`/dev-notes` is an opt-in development route group. It is mounted only when
`appConfig.devNotes.enabled` is true.

### Health routes

```js
import healthRouter from "./health.routes.js";
```

The health router exposes backend health information over HTTP.

Current public endpoints:

| Endpoint                  | Method | Success status | Failure status       | Purpose                                |
| ------------------------- | ------ | -------------- | -------------------- | -------------------------------------- |
| `/api/health`             | `GET`  | `200`          | `503`                | Backend readiness summary              |
| `/api/health/runtime`     | `GET`  | `200`          | none currently       | Backend process / runtime reachability |
| `/api/health/persistence` | `GET`  | `200`          | `503`                | Persistence readiness                  |
| `/api/health/dev-notes`   | `GET`  | `200`          | `503` when unhealthy | Dev-notes subsystem readiness          |

#### `GET /api/health`

Returns backend-wide application readiness.

This route calls the health summary module and maps the result to HTTP status:

```txt
healthy   -> 200
unhealthy -> 503
```

The response includes a route-level timestamp.

The health summary shape is documented in the [health module README](../health/README.md).

#### `GET /api/health/runtime`

Returns runtime health for the backend process.

This endpoint currently always returns HTTP `200` when the backend process can respond.

Runtime health proves process reachability. It does not prove persistence readiness or full
application readiness.

The response includes a route-level timestamp.

The runtime health shape is documented in the [health module README](../health/README.md).

#### `GET /api/health/persistence`

Returns persistence readiness.

This route calls the persistence health module and maps the result to HTTP status:

```txt
healthy -> 200
unhealthy -> 503
```

The response includes a route-level timestamp.

The persistence health shape is documented in the [health module README](../health/README.md).

##### Query parameters

| Query parameter | Value  | Behavior                                           |
| --------------- | ------ | -------------------------------------------------- |
| `details`       | `full` | Returns the full persistence adapter health result |

Example:

```html
GET /api/health/persistence?details=full
```

Any other details value is treated as the default reduced response.

#### `GET /api/health/dev-notes`

Returns dev-notes readiness.

This route calls the dev-notes health subsystem and maps the result to HTTP status:

```txt
healthy -> 200
disabled  -> 200
unhealthy -> 503
```

`disabled` is not treated as a route failure because dev-notes is an optional subsystem.

The response includes a route-level timestamp.

The dev-notes health shape is documented in the [health module README](../health/README.md).

##### Query parameters

| Query parameter | Value  | Behavior                                           |
| --------------- | ------ | -------------------------------------------------- |
| `details`       | `full` | Returns the full dev-notes subsystem health result |

Example:

```html
GET /api/health/dev-notes?details=full
```

Any other details value is treated as the default reduced response.

### Dev-notes routes

```js
import devNotesRouter from "./dev-notes.routes.js";
```

The dev-notes router exposes the development CRUD proof slice over HTTP. This route group is mounted
below `/api/dev-notes` only when dev-notes is enabled.

Current public endpoints:

| Endpoint                      | Method    | Success status | Failure status      | Purpose                                    |
| ----------------------------- | --------- | -------------- | ------------------- | ------------------------------------------ |
| `/api/dev-notes/:storage`     | `GET`     | `200`          | `400`, `404`, `500` | List dev-notes or search by text.          |
| `/api/dev-notes/:storage/:id` | `GET`     | `200`          | `400`, `404`, `500` | Read one dev-note by id.                   |
| `/api/dev-notes/:storage`     | `POST`    | `201`          | `400`, `404`, `500` | Create one dev-note.                       |
| `/api/dev-notes/:storage/:id` | `PUT`     | `200`          | `400`, `404`, `500` | Replace one existing dev-note.             |
| `/api/dev-notes/:storage/:id` | `PATCH`   | `200`          | `400`, `404`, `500` | Update one existing dev-note.              |
| `/api/dev-notes/:storage/:id` | `DELETE`  | `200`          | `400`, `404`, `500` | Delete one existing dev-note.              |
| `/api/dev-notes/:storage`     | `OPTIONS` | `204`          | none currently      | Collection route capability metadata.      |
| `/api/dev-notes/:storage/:id` | `OPTIONS` | `204`          | none currently      | Single-resource route capability metadata. |

The dev-notes API contract is documented in the [dev-notes README](../dev-notes/README.md).

## Route ownership rules

Routes may

- choose HTTP status codes
- read request parameters
- add response metadata such as timestamps
- call backend modules to build response bodies

Routes should not:

- validate persistence config directly
- open database connections directly
- aggregate subsystem health manually
- decide frontend display states

Health behavior belongs to the health module.

Concrete persistence behavior belongs to the active persistence adapter.

Dev-notes storage behavior belongs to the dev-notes module and its storage adapters.

Frontend display behavior belongs to the frontend.

## Timestamp behavior

Health route responses add a `timestamp` field at response time.

The health module does not add timestamps because timestamps are transport metadata, not health
model state.

Current timestamp format:

```js
new Date().toISOString();
```

## Adding routes

When adding a new route group

- create a dedicated route module
- mount it in routes/index.js
- keep business logic outside the route module
- document the public endpoint contract here or in a dedicated route README if the group becomes
  large
- add or update tests

Route modules should stay thin.

If a route starts owning domain behavior, move that behavior into a backend module and let the route
call it.

## Testing

Route behavior is currently covered through backend health smoke tests.

Run:

```bash
npm run check
npm run test:backend:smoke
```

When changing route behavior, test

- expected HTTP status codes
- response JSON shape
- route-level timestamps
- query parameter behavior
- reachable runtime health when persistence is unhealthy

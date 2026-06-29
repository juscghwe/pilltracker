# better-sqlite3 persistence adapter

## Purpose

This module implements the backend persistence adapter using `better-sqlite3`.

It owns SQLite-specific behavior, including:

- SQLite connection creation
- SQLite persistence config validation
- SQLite journal mode setup
- SQLite health proof checks
- SQLite-specific health reporting

Backend consumers should not import this adapter directly.

Consumers should import the active persistence adapter from [the persistence seam](../../README.md)
instead:

```js
import { persistenceAdapter } from "../../index.js";
```

## Public entrypoints

### better-sqlite3 adapter

```js
import { betterSqlitePersistenceAdapter } from "./index.js";
```

The adapter exposes:

```js
getConnection();
getHealth();
```

### `getConnection()`

Returns the active SQLite connection.

The connection is opened lazily. Importing this module should not open the database by itself.

Before opening the connection, the adapter validates the required persistence config:

- `DB_PATH`
- `SQLITE_JOURNAL_MODE`

If persistence config is missing or invalid, `getConnection()` throws.

### `getHealth()`

Returns SQLite persistence health.

`getHealth()` must not throw for expected persistence failures. It should return an unhealthy health
object when SQLite config or access is invalid.

This allows the backend to stay reachable and report persistence diagnostics through health
endpoints.

## Config contract

This adapter requires:

| Environment variable  | Meaning                       | Missing behavior      |
| --------------------- | ----------------------------- | --------------------- |
| `DB_PATH`             | SQLite database file path     | Persistence unhealthy |
| `SQLITE_JOURNAL_MODE` | Requested SQLite journal mode | Persistence unhealthy |

Allowed journal modes are defined by the backend config module.

Current allowed values:

```txt
delete
truncate
persist
memory
wal
off
```

The config module reads these values into `appConfig`.

This adapter owns deciding whether the persistence values are usable.

## Connection behavior

The adapter keeps one module-level SQLite connection.

On first connection use:

1. it validates persistence config
2. opens the SQLite database at `DB_PATH`
3. applies the requested journal mode
4. stores the connection for reuse

Current connection setup:

```js
new Database(DB_PATH);
PRAGMA journal_mode = SQLITE_JOURNAL_MODE;
```

The adapter does not currently expose connection shutdown or reconnection behavior.

If that becomes necessary, add it intentionally and document the lifecycle rules here.

## Health behavior

`getHealth()` validates SQLite persistence by proving:

1. persistence config exists
2. requested journal mode is allowed
3. a SQLite connection can be opened
4. `SELECT 1` succeeds
5. `sqlite_version()` can be queried
6. active `PRAGMA journal_mode` can be observed

A healthy result includes:

```js
{
    status: "healthy",
    engine: {
        reportedFamily: "sqlite",
        version: string,
        source: "database_query",
    },
    adapter: {
        id: "better-sqlite3",
        sourceModule: string,
    },
    journalMode: {
        requested: string,
        active: string,
    },
    path: {
        isConfigured: true,
    },
}
```

An unhealthy result includes:

```js
{
    status: "unhealthy",
    adapter: {
        id: "better-sqlite3",
        sourceModule: string,
    },
    path: {
        isConfigured: boolean,
    },
    journalMode: {
        requested: string | null,
        isConfigured: boolean,
        isValid: boolean,
    },
    error: {
        name: string,
        code: error.code ?? "UNKNOWN_ERROR",
        message: error.message,
        details: error.details ?? null,
    },
}
```

## Failure policy

Expected persistence failures should be reported as unhealthy health results.

Examples:

- missing `DB_PATH`
- missing `SQLITE_JOURNAL_MODE`
- invalid `SQLITE_JOURNAL_MODE`
- unreadable database path
- failed SQLite proof query

Unexpected programming errors may still surface during direct adapter usage.

Health callers should prefer `getHealth()` when they need a non-throwing diagnostic result.

## Ownership rules

This adapter owns SQLite-specific implementation details.

It should not own:

- HTTP response status codes
- API route query parameters
- overall backend readiness aggregation
- user-facing frontend messages

Those belong to the route, health summary and frontend layers.

The persistence seam owns choosing this adapter as the active backend persistence implementation.

## Testing

Adapter behavior is currently tested through backend health smoke tests.

Run:

```bash
npm run check
npm run test:backend:smoke
```

When changing adapter behavior, test at least:

- valid `DB_PATH`
- valid `SQLITE_JOURNAL_MODE`
- missing `DB_PATH`
- missing `SQLITE_JOURNAL_MODE`
- invalid `SQLITE_JOURNAL_MODE`
- unavailable or unreadable database path

The backend should remain reachable when persistence is unhealthy, but overall backend readiness
should report unhealthy.

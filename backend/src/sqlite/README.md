# Backend SQLite module

## Purpose

This module contains shared low-level SQLite helpers used by backend persistence adapters.

It provides reusable connection, journal-mode and health-reporting utilities without owning any
application domain behavior.

The module is intentionally generic. Concrete adapters decide when to open connections, whether to
cache them, which schema to create and how to map database rows to public application objects.

## Public entrypoints

Current public entrypoints are split by responsibility.

### `connection.js`

```js
import {
  openSqliteConnection,
  applySqliteJournalMode,
  getActiveSqliteJournalMode,
  openConfiguredSqliteConnection,
} from "../sqlite/connection.js";
```

| Function                           | Purpose                                                    |
| ---------------------------------- | ---------------------------------------------------------- |
| `openSqliteConnection()`           | Opens a raw SQLite connection for a database path.         |
| `applySqliteJournalMode()`         | Applies a requested SQLite journal mode to a connection.   |
| `getActiveSqliteJournalMode()`     | Reads the active journal mode reported by SQLite.          |
| `openConfiguredSqliteConnection()` | Opens a connection and applies the requested journal mode. |

### `health.js`

```js
import { createSqliteHealthReporter } from "../sqlite/health.js";
```

| Function                       | Purpose                                                    |
| ------------------------------ | ---------------------------------------------------------- |
| `createSqliteHealthReporter()` | Creates a reusable health reporter for one SQLite adapter. |

## Connection helpers

### `openSqliteConnection(input)`

Opens a SQLite connection.

Input:

```js
{
  databasePath: string,
}
```

Returns:

```js
better - sqlite3.Database;
```

This function should only create the connection.

It should not:

- validate app config
- apply journal mode
- create schema
- seed data
- cache the connection
- know which backend feature owns the database

### `applySqliteJournalMode(input)`

Applies a requested SQLite journal mode to an existing connection.

Input:

```js
{
  connection: better-sqlite3.Database,
  requestedJournalMode: string,
}
```

Returns:

```js
string;
```

The return value is the active journal mode reported by SQLite after the `PRAGMA journal_mode` call.

This helper does not decide whether a mismatch is acceptable. Concrete adapters own that decision.

### `getActiveSqliteJournalMode(connection)`

Reads the active SQLite journal mode from an existing connection.

Returns:

```js
string;
```

Throws a `TypeError`, if SQLite reports a non-string journal mode.

### `openConfiguredSqliteConnection(input)`

Opens a SQLite connection and applies the requested journal mode.

Input:

```js
{
  databasePath: string,
  requestedJournalMode: string,
}
```

Returns:

```js
better - sqlite3.Database;
```

This function combines low-level setup steps only.

It should not:

- validate application config
- create schemas
- seed data
- cache connections
- own adapter lifecycle

## Health reporter

### `createSqliteHealthReporter(input)`

Creates a health reporter for one concrete SQLite adapter.

Input:

```js
{
  adapterId: string,
  sourceModule: string,
  databasePath: string | null,
  requestedJournalMode: string | null,
  validJournalModes: Set<string>,
  getConnection: () => better-sqlite3.Database,
}
```

Returns:

```js
() => Readonly<SqliteHealthResult>
```

The returned reporter:

1. calls the adapter-provided `getConnection()`
2. runs a simple SQLite proof query
3. reads SQLite engine metadata
4. reports adapter metadata
5. reports journal-mode metadata
6. reports path configuration metadata
7. normalizes thrown errors into health-safe error objects

The health reporter should represent configuration and connection failures as unhealthy health
results instead of letting errors escape health endpoints.

## Health result shape

SQLite health results use this high-level shape:

```js
{
  status: "healthy" | "unhealthy",
  adapter: {
    id: string,
    sourceModule: string,
  },
  journalMode: {
    requested: string | null,
    active: string | null,
    isConfigured: boolean,
    isValid: boolean,
  },
  path: {
    isConfigured: boolean,
  },
}
```

Healthy results also include:

```js
engine: {
  reportedFamily: "sqlite",
  version: string,
  source: "database_query",
}
```

Unhealthy results also include:

```js
error: {
  name: string,
  code: string,
  message: string,
  details: object | null,
}
```

## Adapter ownership

Concrete adapters own:

- config validation for their required values
- connection caching
- schema creation
- migrations
- seed data
- domain row mapping
- deciding whether active journal mode mismatches are fatal
- exposing adapter health to higher-level modules

The shared SQLite module owns only generic SQLite mechanics.

## Security and exposure notes

SQLite health results may include implementation details such as adapter identifiers, source module
URLs, engine version, journal-mode metadata and normalized error messages.

That is useful during development and internal health checks, but production/public endpoints should
review whether detailed health output needs redaction or admin-only access.

> [!WARNING]
>
> Do not expose raw stack traces through public API responses.

## Usage example

A concrete adapter may use the shared helpers like this:

```js
const connection = openConfiguredSqliteConnection({
  databasePath,
  requestedJournalMode,
});
```

And expose health like this:

```js
export const getHealth = createSqliteHealthReporter({
  adapterId,
  sourceModule: import.meta.url,
  databasePath,
  requestedJournalMode,
  validJournalModes,
  getConnection,
});
```

## Adding SQLite helpers

When adding shared SQLite helpers:

1. Keep them generic. Do not import feature modules such as medication, dev-notes, routes or health
   summary modules.
2. Do not read `process.env` directly.
3. Prefer explicit input objects over hidden global state.
4. Document ownership boundaries in this README.

For changes affecting persistence or health behavior, also run backend smoke tests.

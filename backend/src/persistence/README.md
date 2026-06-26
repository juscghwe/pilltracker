# Backend persistence module

## Purpose

This module exposes the active persistence adapter used by backend modules.

It acts as the persistence seam between backend consumers and the concrete persistence implementation.

Consumers should depend on this module instead of importing a concrete adapter directly. (see [Section Adapter ownership](#adapter-ownership) for more information about why)

## Public entrypoints

### `persistenceAdapter`

```js
import { persistenceAdapter } from "./persistence/index.js";
```

`persistenceAdapter` is the active persistence adapter for the backend.

<details>

<summary>Current implementation with `better-sqlite3`</summary>

> [!Warning]
>
> These methods are not provided by the `persistenceAdapter` itself but the concrete adapter loaded by the `persistenceAdapter`. Thereby they can be subject to change.

Current active adapter: `better - sqlite3`

Current adapter capabilities:

```js
getConnection(); // returns the active database connection
getHealth(); // returns persistence adapter health
```

</details>

## Import rules

Backend modules should import the active adapter seam:

```js
import { persistenceAdapter } from "../persistence/index.js";
```

Backend modules should not import concrete adapters directly:

```js
// Avoid this in consumers:
import { betterSqlitePersistenceAdapter } from "../persistence/adapters/better-sqlite3/index.js";
```

Concrete adapter imports should stay inside this module unless a test intentionally targets the adapter implementation.

## Adapter ownership

This module owns adapter selection.

Concrete adapters own implementation details such as:

- database driver setup
- connection lifecycle
- database-specific health checks
- database-specific configuration validation
- database-specific proof queries

The health module may call the active adapter, but it should not know which concrete adapter is active.

## Switching adapters

To switch the active persistence implementation, update this module to export a different adapter.

Consumers should not need to change when the active adapter changes.

Expected switching point:

```js
import { persistenceAdapter as selectedAdapter } from "./adapters/some-adapter/index.js";

export const persistenceAdapter = selectedAdapter;
```

When switching adapters update:

- this README
- the concrete adapter README
- persistence health expectations
- backend smoke tests
- deployment configuration if required

## Runtime behavior

The persistence module should not open a database connection by being imported.

Database connections should be opened by adapter methods such as `getConnection()` or by health checks that intentionally prove persistence availability.

This keeps imports lightweight and allows the backend to report useful health information even when persistence configuration is invalid.

## Testing

Persistence behavior is currently covered through backend health smoke tests.

Run:

```bash
npm run check
npm run test:backend:smoke
```

When changing the active adapter, also test:

- valid persistence configuration
- missing database path
- missing journal mode
- invalid journal mode
- unavailable or unreadable database location

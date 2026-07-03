# Backend config module

## Purpose

This module reads backend runtime configuration from environment variables and exposes the resolved
config to the rest of the backend.

It owns app-level config validation and keeps subsystem-specific config values for the modules that
validate them.

## Public entrypoints

- `environmentKeys`
- `validEnvironments`
- `validSqliteJournalModes`
- `appConfig`

### App runtime

| Variable                            | Required | Default                   | Owner                           | Failure behavior                                                     |
| ----------------------------------- | -------- | ------------------------- | ------------------------------- | -------------------------------------------------------------------- |
| `APP_DB_PATH`                       | no       | `null`                    | persistence adapter             | unhealthy persistence                                                |
| `APP_SQLITE_JOURNAL_MODE`           | no       | `null`                    | persistence adapter             | unhealthy persistence if invalid/unsupported                         |
| `DEV_NOTES_ENABLE`                  | no       | `false`                   | config/routes                   | route group not mounted when false                                   |
| `DEV_NOTES_ENABLE_IN_MEMORY`        | no       | `true`                    | dev-notes                       | temp storage disabled when false                                     |
| `DEV_NOTES_IN_MEMORY_PATH`          | no       | `:memory:`                | dev-notes sqlite-memory adapter | unhealthy if invalid                                                 |
| `DEV_NOTES_IN_MEMORY_JOURNAL_MODE`  | no       | `memory`                  | dev-notes sqlite-memory adapter | unhealthy if invalid                                                 |
| `DEV_NOTES_ENABLE_PERSISTENT`       | no       | `true`                    | dev-notes                       | persistent storage disabled when false                               |
| `DEV_NOTES_DB_PATH`                 | no       | `null`                    | dev-notes sqlite-file adapter   | persistent storage unhealthy/disabled-ish depending current contract |
| `DEV_NOTES_PERSISTENT_JOURNAL_MODE` | no       | `APP_SQLITE_JOURNAL_MODE` | dev-notes sqlite-file adapter   | unhealthy if invalid                                                 |

### `validEnvironments`

Allowed values for `NODE_ENV`.

Current values:

```
development
test
production
```

### `validSqliteJournalModes`

Allowed values for `SQLITE_JOURNAL_MODE`.

Current values:

```
delete
truncate
persist
memory
wal
off
```

### `appConfig`

Resolved backend configuration object.

Usage:

```js
import { appConfig } from "./appConfig.js";
```

`appConfig` has this shape:

```js
{
    environment: "development" | "test" | "production",

    app: {
        persistence: {
            path: string | null,

            sqlite: {
                requestedJournalMode:
                    | "delete"
                    | "truncate"
                    | "persist"
                    | "memory"
                    | "wal"
                    | "off"
                    | null,
            },
        },
    },

    devNotes: DevNotesObj,
}
```

With `DevNotesObj` shape:

```js
{
    enabled: bool | false,

    storage: {
      temp: {
        enabled: bool | true,
        databasePath: string | ":memory:",
        journalMode: string | "memory",
      },

      persistent: {
        enabled: bool | true,
        databasePath: string,
        journalMode: string | APP_SQLITE_JOURNAL_MODE,
      },
    },
},
```

## Runtime behavior

### App-level config

`NODE_ENV` is required app-level config.

If `NODE_ENV` is missing or invalid, the backend should fail during startup. The app should not
silently fall back to `development`.

### Persistence-level config

`APP_DB_PATH` and `APP_SQLITE_JOURNAL_MODE` are persistence-level config.

They are intentionally allowed to be `null` in `appConfig` so the persistence layer can report
missing or invalid persistence config through health checks instead of hiding backend runtime
health.

## Config ownership rules

App-level config belongs here.

Subsystem config may be read here, but subsystem-specific validation should stay with the subsystem
when the app must still be able to report partial health.

Current split:

|                           | owner                | missing/invalid behavior |
| ------------------------- | -------------------- | ------------------------ |
| `NODE_ENV`                | `config` module      | startup failure          |
| `APP_DB_PATH`             | `persistence` module | persistence unhealthy    |
| `APP_SQLITE_JOURNAL_MODE` | `persistence` module | persistence unhealthy    |

## Usage rules

Consumers should import `appConfig` instead of reading `process.env` directly.

Allowed-value sets may be imported when another module needs to validate the same public config
contract.

Example:

```js
import { appConfig, validSqliteJournalModes } from "../config/appConfig.js";
```

Do not add silent defaults for required app-level config without documenting the operational reason.

> [!IMPORTANT]
>
> Do not validate e.g. persistence readiness in this module. Persistence readiness belongs to the
> persistence adapter and health checks.

## Testing

Config behavior is currently covered indirectly through backend startup and health smoke tests.

When adding new config values, check:

```bash
npm run check
npm run test:backend:smoke
```

For config that affects startup also test the missing or invalid environment variable case manually.

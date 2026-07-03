# Backend errors module

## Purpose

This module contains shared backend error classes. Errors in this module provide stable
machine-readable error codes and structured diagnostic details for backend modules. They are
intended for internal backend control flow, health reporting, logging and safe error normalization.
This module does not own HTTP response formatting. Route layers decide how errors are exposed to
clients.

## Public entrypoints

The public entrypoints are exported through `backend/src/errors/index.js`.

```js
import {
  AppError,
  MissingEnvironmentVariableError,
  InvalidEnvironmentVariableError,
  SqliteJournalModeMismatchError,
} from "../errors/index.js";
```

Current exports:

| Export                            | Purpose                                                  |
| --------------------------------- | -------------------------------------------------------- |
| `AppError`                        | Base application error with stable error code metadata.  |
| `MissingEnvironmentVariableError` | Error for required environment variables that are unset. |
| `InvalidEnvironmentVariableError` | Error for environment variables with unsupported values. |
| `SqliteJournalModeMismatchError`  | Error for unexpected SQLite journal-mode behavior.       |

## Error model

### `AppError`

`AppError` is the base class for application-specific backend errors. It extends the native `Error`
class and adds:

| Property  | Type     | Purpose                               |
| --------- | -------- | ------------------------------------- |
| `name`    | `string` | Concrete error class name.            |
| `code`    | `string` | Stable machine-readable error code.   |
| `details` | `object` | Frozen structured diagnostic details. |
| `cause`   | `Error`  | Optional lower-level error cause.     |

`AppError` should be used when a module needs a stable error code instead of relying only on
human-readable error messages.

### Stable error codes

Error codes are intended for:

- health result normalization
- logging
- debugging
- future API-safe error mapping
- tests that should not depend on full message text

Error messages may change for readability. Error codes should remain stable unless the meaning of
the error changes.

## Current error classes

### `MissingEnvironmentVariableError`

Thrown when a required environment variable is missing or empty. Use this when a module cannot
operate without a required configuration value.

```txt
CONFIG_MISSING_ENVIRONMENT_VARIABLE
```

Details:

```js
{
  variableName,
  moduleName,
}
```

### `InvalidEnvironmentVariableError`

Thrown when an environment variable exists but contains an unsupported value. Use this when a config
value is present but outside the accepted contract.

```txt
CONFIG_INVALID_ENVIRONMENT_VARIABLE
```

Details:

```js
{
  variableName,
  actualValue,
  allowedValues,
  moduleName,
}
```

### `SqliteJournalModeMismatchError`

Thrown when SQLite reports a different active journal mode than the mode requested by the adapter.
Use this when an adapter requires SQLite to honor a specific journal mode before continuing.

```txt
SQLITE_JOURNAL_MODE_MISMATCH
```

Details:

```js
{
  requestedJournalMode,
  activeJournalMode,
  moduleName,
}
```

## Ownership rules

This module owns:

- shared backend error base classes
- stable machine-readable error codes
- structured diagnostic error details
- error classes reused across backend modules

This module does not own:

- logging output format
- user-facing error text
- error behavior handling (neither induce it)

## Public exposure rules

Errors may contain internal diagnostic details. Do not expose raw errors, stack traces, source
module paths or full internal details directly to unauthenticated/public clients. Routes and health
endpoints should expose only the detail level appropriate for their audience.

> [!CAUTION]
>
> Current development health endpoints may expose more detail than a production endpoint should.
> Before production hardening, detailed health/debug responses should be reviewed and possibly
> restricted to admin/debug contexts.

## Adding new errors

When adding a new shared error:

1. Extend `AppError`.
2. Use a stable uppercase `code`.
3. Put structured metadata in `details`.
4. Avoid encoding important machine-readable state only in `message`.
5. Export the error from `backend/src/errors/index.js`.

Example shape:

```js
export class ExampleError extends AppError {
  constructor(input) {
    super("Human-readable message.", {
      code: "EXAMPLE_ERROR",
      details: {
        field: input.field,
      },
    });
  }
}
```

## Testing

Error behavior is currently covered indirectly through modules that throw or normalize these errors.

When adding or changing error classes, check for synthax, integration, typing and linting:

```bash
npm run check
```

For errors that affect backend startup, config, persistence or health behavior, also test at least
one failing runtime case manually.

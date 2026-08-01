# Dev-notes

## Purpose

`dev-notes` is the disposable M1 backend resource used to prove the project's HTTP, validation,
service, repository, SQLite, health, and frontend integration boundaries.

It is deliberately separate from the medication domain and must not be used for medication
persistence. Both storage targets use dedicated dev-notes databases.

## Architecture

The module owns its complete vertical slice:

```text
routes.js
  -> service/
    -> validation/
      -> resource contract and operation policies
    -> repository port
      <- adapters/sqlite/
        -> temp or persistent connection
  -> health/
```

The application mounts the composed router exported by `index.js` at `/api/dev-notes`. Other backend
modules consume only the public exports from `index.js`; they do not import concrete repositories.

See:

- [`relationships.md`](./relationships.md) for the compact dependency map and field-identity rules.
- [`milestone1-architecture.md`](./milestone1-architecture.md) for the detailed M1 architecture
  target and ownership model.

## Module layout

```text
dev-notes/
  index.js
  routes.js
  README.md
  relationships.md
  milestone1-architecture.md

  resource/
    contract.js
    operations.js
    types.js

  validation/
    command-validation.js
    field-validation.js

  service/
    dev-notes-service.js
    result-builders.js

  repository/
    repository-port.js

  adapters/sqlite/
    sqlite-repository.js
    sqlite-schema.js
    sqlite-mapping.js
    sqlite-statements.js
    sqlite-health.js
    temp/connection.js
    persistent/connection.js

  health/
    dev-notes-health.js
    dev-notes-health-summary.js
```

## Resource contract

`resource/contract.js` is the single source of truth for public field names, SQLite column names,
types, nullability, writability, generated fields, and null-output fallbacks.

| Public field               | SQLite column                | Client writable | Notes                                 |
| -------------------------- | ---------------------------- | --------------- | ------------------------------------- |
| `id`                       | `id`                         | no              | Generated integer primary key         |
| `name`                     | `name`                       | yes             | Required, non-empty string            |
| `comment`                  | `comment`                    | yes             | Nullable in storage, returned as `""` |
| `lastConfirmedInteraction` | `last_confirmed_interaction` | yes             | Nullable in storage, returned as `""` |
| `createdAt`                | `created_at`                 | no              | Generated ISO timestamp               |
| `updatedAt`                | `updated_at`                 | no              | Generated ISO timestamp               |

Contract keys, public names, and SQLite column names are separate identities even when two values
currently happen to match.

## Storage targets

The API selects a target through the `:storage` path parameter.

| Target       | Default backing store | Purpose                                      |
| ------------ | --------------------- | -------------------------------------------- |
| `temp`       | SQLite `:memory:`     | Disposable development and smoke-test data   |
| `persistent` | Configured file path  | File-backed disposable dev-notes persistence |

Both targets implement the same repository port and use the same contract-derived `dev_notes` table
schema. A known disabled target returns `storage-disabled`; an unknown target returns
`unknown-storage`.

Runtime configuration is owned by `backend/src/config/appConfig.js`.

## HTTP API

Base path: `/api/dev-notes`

| Method    | Path                    | Input                                                   |
| --------- | ----------------------- | ------------------------------------------------------- |
| `GET`     | `/:storage`             | Lists all notes                                         |
| `GET`     | `/:storage?text=query`  | Searches searchable fields by required non-empty `text` |
| `GET`     | `/:storage/:id`         | Reads one note by positive integer id                   |
| `POST`    | `/:storage`             | Body: `{ "name": "...", "comment": "..." }`             |
| `PUT`     | `/:storage/:id`         | Body: `{ "name": "...", "comment": "..." }`             |
| `PATCH`   | `/:storage/:id`         | Any non-empty subset of writable update fields          |
| `DELETE`  | `/:storage/:id`         | Deletes and returns the existing note                   |
| `OPTIONS` | collection or item path | Returns the route's `Allow` header                      |

`PUT` replaces the editable content fields and clears `lastConfirmedInteraction`. `PATCH` may update
`name`, `comment`, and `lastConfirmedInteraction` without changing unprovided fields.

`HEAD` is not part of the current contract.

## Result statuses

| Status             | HTTP status | Meaning                                  |
| ------------------ | ----------- | ---------------------------------------- |
| `ok`               | `200`       | Read/list/search succeeded               |
| `created`          | `201`       | Resource created                         |
| `replaced`         | `200`       | Existing resource replaced               |
| `updated`          | `200`       | Existing resource updated                |
| `deleted`          | `200`       | Existing resource deleted and returned   |
| `invalid-request`  | `400`       | Structured command validation failed     |
| `not-found`        | `404`       | A valid id did not resolve to a resource |
| `unknown-storage`  | `404`       | Storage kind is not registered           |
| `storage-disabled` | `404`       | Registered storage target is disabled    |
| `operation-failed` | `500`       | Repository operation failed unexpectedly |

Validation reports stable problems under `details.problems`. Raw request values never reach the
repository until command validation has normalized them.

## Health

Dev-notes health is dependency-focused and read-only apart from normal lazy connection/schema
initialization. Each enabled repository reports SQLite connectivity, journal-mode state, engine
metadata, and exact schema compatibility with the resource contract.

Exports:

- `getDevNotesHealth()` returns detailed storage health.
- `getDevNotesHealthPartial()` returns the condensed backend-summary shape.

The backend exposes these through `/api/health/dev-notes` and the overall `/api/health` summary.

## Verification

From the repository root:

```bash
npm run check
npm run fix
npm run test:backend:smoke:compose
```

The smoke suite covers health, contract-derived SQLite schema, and HTTP CRUD behavior for enabled
storage targets.

## Scope

This module remains a proof resource. Its job is to establish reusable boundaries and integration
patterns for M1, not to become the medication-domain model.

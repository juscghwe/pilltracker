# Dev-notes

## Purpose

`dev-notes` is a disposable CRUD proof slice for backend API, storage, validation and route wiring
experiments. It will become crucial part for experiments, migration and testing later.

It must not be used for medication-domain persistence. Its databases are separate from the main app
persistence layer.

## Layering

Route layer (`/backend/src/routes/`):

- extracts raw HTTP values from params, query and body
- maps facade result statuses to HTTP status codes
- does not import concrete storage adapters

Facade layer (`/backend/src/dev-notes/`):

- validates and normalizes input
- resolves the requested storage target
- calls the selected storage adapter
- returns stable `{ ok, status, ... }` results

Adapter layer (`/backend/src/dev-notes/adapters/{}`):

- owns concrete SQLite table layout and SQL
- maps database rows to public `DevNote` objects
- returns `null` only when no single dev-note can be returned
- throws for configuration, connection, journal mode and unexpected SQL failures

## Storage targets

Dev-notes supports two storage targets: `temp` and `persistent`.

Storage targets are selected through the `:storage` route parameter and resolved by the dev-notes
facade before any adapter operation is called.

| Storage target | Adapter         | Backing store                     | Purpose                                                                                                                       |
| -------------- | --------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `temp`         | `sqlite-memory` | SQLite memory database by default | Disposable dev/testing storage. Data is not expected to survive normal runtime resets unless explicitly configured otherwise. |
| `persistent`   | `sqlite-file`   | Separate SQLite database file     | Disposable but file-backed dev/testing storage. Must remain separate from medication-domain persistence.                      |

Both storage targets are optional runtime capabilities. A known but disabled storage target returns
the public `storage-disabled` facade status. An unknown storage target returns `unknown-storage`.

Routes must not import concrete storage adapters directly. They call the dev-notes facade and the
facade resolves the requested storage target.

## HTTP API contract

Base path when mounted:

`/api/dev-notes`

| Method  | Path                    | Input                                       | Success                            | Notes                                                        |
| ------- | ----------------------- | ------------------------------------------- | ---------------------------------- | ------------------------------------------------------------ |
| GET     | `/:storage`             | route param `storage`                       | `200` with `{ ok, status, notes }` | Lists all notes. Empty list is success.                      |
| GET     | `/:storage?text=search` | route param `storage`, query `text`         | `200` with `{ ok, status, notes }` | Filtered collection search. Empty result is success.         |
| GET     | `/:storage/:id`         | route params `storage`, `id`                | `200` with `{ ok, status, note }`  | Returns `404` when id is valid but row does not exist.       |
| POST    | `/:storage`             | JSON body `{ "text": "..." }`               | `201` with `{ ok, status, note }`  | Creates one note.                                            |
| PUT     | `/:storage/:id`         | route params, JSON body `{ "text": "..." }` | `200` with `{ ok, status, note }`  | Replaces existing note. No upsert.                           |
| PATCH   | `/:storage/:id`         | route params, JSON body `{ "text": "..." }` | `200` with `{ ok, status, note }`  | Updates existing note. Currently same mutable fields as PUT. |
| DELETE  | `/:storage/:id`         | route params `storage`, `id`                | `200` with `{ ok, status, note }`  | Returns deleted note.                                        |
| OPTIONS | `/:storage`             | none                                        | `204` with `Allow`                 | Route capability metadata.                                   |
| OPTIONS | `/:storage/:id`         | none                                        | `204` with `Allow`                 | Route capability metadata.                                   |

`HEAD` is intentionally not part of the current contract yet.

## Facade contract

Facade functions are exported through `backend/src/dev-notes/index.js`.

| Function                      | Purpose                                         |
| ----------------------------- | ----------------------------------------------- |
| `listDevNotes(input)`         | Lists all dev-notes in one storage target.      |
| `searchDevNotesByText(input)` | Searches dev-notes by text fragment.            |
| `getDevNoteById(input)`       | Gets one dev-note by id.                        |
| `createDevNote(input)`        | Creates one dev-note.                           |
| `replaceDevNote(input)`       | Replaces one existing dev-note.                 |
| `updateDevNote(input)`        | Updates one existing dev-note.                  |
| `deleteDevNote(input)`        | Deletes one existing dev-note and returns it.   |
| `optionsStorageOnly()`        | Returns collection route `Allow` metadata.      |
| `optionsStorageAndId()`       | Returns single-resource route `Allow` metadata. |
| `getDevNotesHealth()`         | Returns full dev-notes subsystem health.        |
| `getDevNotesHealthPartial()`  | Returns condensed dev-notes subsystem health.   |

## Adapter contract

Every dev-notes storage adapter implements `DevNotesStorageAdapter`.

Adapters must expose:

| Method                        | Return                    | Expected behavior                                             | `sqlite-file`      | `sqlite-memory`    |
| ----------------------------- | ------------------------- | ------------------------------------------------------------- | ------------------ | ------------------ |
| `getConnection()`             | `better-sqlite3.Database` | Returns active configured SQLite connection.                  | :white_check_mark: | :white_check_mark: |
| `getHealth()`                 | `Readonly<object>`        | Returns adapter health.                                       | :white_check_mark: | :white_check_mark: |
| `listDevNotes()`              | `DevNote[]`               | Returns all notes ordered by id. Empty array is success.      | :white_check_mark: | :white_check_mark: |
| `searchDevNotesByText(input)` | `DevNote[]`               | Returns matching notes ordered by id. Empty array is success. | :white_check_mark: | :white_check_mark: |
| `getDevNoteById(input)`       | `DevNote \| null`         | Returns one note or `null`.                                   | :white_check_mark: | :white_check_mark: |
| `createDevNote(input)`        | `DevNote \| null`         | Returns created note or `null` when input cannot create one.  | :white_check_mark: | :white_check_mark: |
| `replaceDevNote(input)`       | `DevNote \| null`         | Returns replaced note or `null`. No upsert.                   | :white_check_mark: | :white_check_mark: |
| `updateDevNote(input)`        | `DevNote \| null`         | Returns updated note or `null`.                               | :white_check_mark: | :white_check_mark: |
| `deleteDevNote(input)`        | `DevNote \| null`         | Returns deleted note or `null`.                               | :white_check_mark: | :white_check_mark: |

Adapters are allowed to return `null` for single-resource operations when no note can be returned.
Adapters should throw for configuration, connection, journal mode, and unexpected SQL execution
failures.

The facade translates adapter `null` into public facade statuses such as `not-found` or
`operation-failed`.

## Concrete storage adapters

### `sqlite-file`

Persistent dev-notes storage.

- table: `dev_notes`
- text column: `text`
- intended for file-backed disposable dev-notes data
- separate from medication-domain persistence

### `sqlite-memory`

Temporary dev-notes storage.

- table: `dev_notes_temp`
- text column: `text_temp`
- defaults to SQLite `:memory:` storage
- may be file-backed if configured for development experiments

## Result statuses

| Facade status      | HTTP status | Meaning                                           |
| ------------------ | ----------- | ------------------------------------------------- |
| `ok`               | `200`       | Request succeeded and returns existing data.      |
| `created`          | `201`       | Resource was created.                             |
| `replaced`         | `200`       | Existing resource was replaced.                   |
| `updated`          | `200`       | Existing resource was updated.                    |
| `deleted`          | `200`       | Existing resource was deleted and returned.       |
| `invalid-request`  | `400`       | Input was missing, empty, wrong type, or invalid. |
| `not-found`        | `404`       | Requested resource does not exist.                |
| `unknown-storage`  | `404`       | Requested storage kind is unknown.                |
| `storage-disabled` | `404`       | Requested storage target is configured off.       |
| `operation-failed` | `500`       | Server-side operation failed unexpectedly.        |

## Validation rules

The facade validates user-facing input before calling adapters.

Validation distinguishes:

| Reason          | Meaning                                                                     |
| --------------- | --------------------------------------------------------------------------- |
| `missing`       | Required field was not provided.                                            |
| `empty`         | Field exists but is blank after trimming.                                   |
| `wrong-type`    | Field exists but is not the expected JavaScript type.                       |
| `invalid-value` | Field has the right basic type but is not acceptable, e.g. non-positive id. |

## Health contract

Dev-notes health is layered:

1. Adapter health checks concrete storage configuration and SQLite reachability.
2. Dev-notes health aggregates enabled storage targets.
3. Backend health consumes dev-notes health through the dev-notes public module.

Backend health must not import concrete dev-notes adapters directly.

Current adapter health checks connection, SQLite probe query, SQLite version, journal mode metadata,
adapter identity, and configured path state.

Future adapter health should add schema checks:

- expected table exists
- expected columns exist
- table can be counted without relying on a specific row id

### Health ownership

| Layer            | Module                             | Responsibility                                                                         |
| ---------------- | ---------------------------------- | -------------------------------------------------------------------------------------- |
| Adapter health   | `dev-notes/adapters/sqlite-file`   | Reports persistent SQLite file adapter health.                                         |
| Adapter health   | `dev-notes/adapters/sqlite-memory` | Reports temporary SQLite memory adapter health.                                        |
| Dev-notes health | `dev-notes/health.js`              | Aggregates enabled dev-notes storage targets.                                          |
| Backend health   | `health/dev-notes.js`              | Exposes dev-notes health to backend health routes without importing concrete adapters. |

### Health API status

| Contract                    | Function / route             | Status             |
| --------------------------- | ---------------------------- | ------------------ |
| Full dev-notes health       | `getDevNotesHealth()`        | :white_check_mark: |
| Partial dev-notes health    | `getDevNotesHealthPartial()` | :white_check_mark: |
| Backend health integration  | `GET /health/dev-notes`      | :white_check_mark: |
| Backend summary integration | `GET /health`                | :white_check_mark: |

## Open items

The current dev-notes contract intentionally leaves the following work open:

| Area                 | Status                                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `REST` returns       | Not correctly implemented yet. See [MDN_ docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/). |
| `HEAD` routes        | Not implemented yet.                                                                                                  |
| Health aggregation   | Planned through dev-notes health getters and backend health aggregation.                                              |
| Schema health checks | Planned for concrete SQLite adapter health.                                                                           |
| Tests                | Planned after README, typedefs, and JSDoc are stable.                                                                 |
| CI                   | Planned after the first dev-notes test slice exists.                                                                  |

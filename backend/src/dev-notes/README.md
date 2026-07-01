## Health

<!-- TODO: Add implementation in ./health and ./routes/health.routes.js -->

<!--
// Health architecture:
// - adapter health verifies concrete SQLite config, connection, and schema.
// - dev-notes health aggregates enabled storage targets.
// - backend health only consumes dev-notes health; it must not import concrete adapters.
-->

<!--
TODO 1: add sqlite-file/health.js
TODO 2: add sqlite-memory/health.js
TODO 3: add dev-notes/health.js aggregator
TODO 4: add health/dev-notes.js backend wrapper
TODO 5: wire into health summary
-->

| REST            | Method | file                  | memory                | seam                  |
| --------------- | ------ | --------------------- | --------------------- | --------------------- |
| `GET` _full_    |        | :white_square_button: | :white_square_button: | :heavy_minus_sign:    |
| `GET` _partial_ |        | :white_square_button: | :white_square_button: | :heavy_minus_sign:    |
| `GET` _full_    |        | :heavy_minus_sign:    | :heavy_minus_sign:    | :white_square_button: |
| `GET` _summary_ |        | :heavy_minus_sign:    | :heavy_minus_sign:    | :white_square_button: |

## CRUD

| REST              | Method                      | file               | memory             |
| ----------------- | --------------------------- | ------------------ | ------------------ |
| `GET` _all_       | listDevNotes()              | :white_check_mark: | :white_check_mark: |
| `GET` _id_        | getDevNoteById(input)       | :white_check_mark: | :white_check_mark: |
| `GET` _text_      | searchDevNotesByText(input) | :white_check_mark: | :white_check_mark: |
| `POST`            | createDevNote(input)        | :white_check_mark: | :white_check_mark: |
| `PUT` _defensive_ | replaceDevNote(input)       | :white_check_mark: | :white_check_mark: |
| `PATCH`           | updateDevNote(input)        | :white_check_mark: | :white_check_mark: |
| `DELETE`          | deleteDevNote(input)        | :white_check_mark: | :white_check_mark: |

`HEAD` and `OPTIONS` will be handled by the router or seam adapter.

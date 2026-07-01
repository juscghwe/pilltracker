## Health

<!-- TODO: Add implementation in ./health and ./routes/health.routes.js -->

| REST            | Method | file | memory | seam |
| --------------- | ------ | ---- | ------ | ---- |
| `GET` _full_    |        | [ ]  | [ ]    | -    |
| `GET` _partial_ |        | [ ]  | [ ]    | -    |
| `GET` _full_    |        | -    | -      | [ ]  |
| `GET` _summary_ |        | -    | -      | [ ]  |

## CRUD

| REST              | Method                      | file | memory |
| ----------------- | --------------------------- | ---- | ------ |
|                   |
| `GET` _all_       | listDevNotes()              | [x]  | [ ]    |
| `GET` _id_        | getDevNoteById(input)       | [x]  | [ ]    |
| `GET` _text_      | searchDevNotesByText(input) | [x]  | [ ]    |
| `POST`            | createDevNote(input)        | [x]  | [ ]    |
| `PUT` _defensive_ | replaceDevNote(input)       | [x]  | [ ]    |
| `PATCH`           | updateDevNote(input)        | [x]  | [ ]    |
| `DELETE`          | deleteDevNote(input)        | [x]  | [ ]    |

`HEAD` and `OPTIONS` will be handled by the router or seam adapter.

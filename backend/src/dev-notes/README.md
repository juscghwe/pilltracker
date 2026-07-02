## Health

| REST              | Method                     | file | memory | seam               |
| ----------------- | -------------------------- | ---- | ------ | ------------------ |
| `GET` _full_      |                            |      |        |                    |
| `GET` _partial_   |                            |      |        |                    |
| `GET` _full_      | getDevNotesHealth()        |      |        | :white_check_mark: |
| `GET` _partially_ | getDevNotesHealthPartial() |      |        | :white_check_mark: |

## CRUD

| REST                | Method                      | file               | memory             | seam               |
| ------------------- | --------------------------- | ------------------ | ------------------ | ------------------ |
| `GET` _all_         | listDevNotes()              | :white_check_mark: | :white_check_mark: |                    |
| `GET` _id_          | getDevNoteById(input)       | :white_check_mark: | :white_check_mark: |                    |
| `GET` _text_        | searchDevNotesByText(input) | :white_check_mark: | :white_check_mark: |                    |
| `POST`              | createDevNote(input)        | :white_check_mark: | :white_check_mark: |                    |
| `PUT` _defensive_   | replaceDevNote(input)       | :white_check_mark: | :white_check_mark: |                    |
| `PATCH`             | updateDevNote(input)        | :white_check_mark: | :white_check_mark: |                    |
| `DELETE`            | deleteDevNote(input)        | :white_check_mark: | :white_check_mark: |                    |
| `OPTIONS` _storage_ | headStorageAndId()          |                    |                    | :white_check_mark: |
| `OPTIONS` _id_      | headStorageOnly()           |                    |                    | :white_check_mark: |

<!--`HEAD` is to be done later -->

<!-- TODO: Implement correct response types. See https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/ -->

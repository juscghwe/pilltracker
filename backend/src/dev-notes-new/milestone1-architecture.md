Purpose of the document:

1. Purpose of dev-notes

Disposable M1 CRUD/resource proving ground, not medication domain.

2. Boundary diagram

route → validator/normalizer → service/facade → repository port → sqlite adapter → db

3. Data shapes

- raw HTTP input
- normalized command
- repository input
- SQLite row
- public API resource

4. Resource contract ownership

one place owns fields, column names, writability, nullability, output fallback

5. What can be generic

- schema generation
- schema validation
- row mapping
- select aliases
- basic command validation
- safe dynamic PATCH SET clauses

6. What stays explicit

- route semantics
- operation statuses
- storage selection
- search behavior
- timestamp behavior
- health summary policy

7. Health model

- health is read-only
- health validates connection + schema
- CRUD smoke validates behavior
- health does not create/delete rows intentionally except normal DB init

8. Test model

- schema contract test
- CRUD API smoke
- health smoke

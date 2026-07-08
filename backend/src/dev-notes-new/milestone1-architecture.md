# Dev-notes M1 Backend Target

Dev-notes is a disposable M1 backend resource used to prove CRUD, health reporting, validation,
storage boundaries and frontend/backend interaction patterns.

It is not the final medication-domain model.

## Goals

- Provide a clear backend CRUD/resource proving ground.
- Keep HTTP, validation, service, repository, adapter and storage concerns separated.
- Define dev-note field/schema truth once through a resource contract.
- Use tests to validate API behavior without turning health checks into behavior tests.
- Keep health checks read-only and dependency-focused.

## High-level dev-notes boundary diagram

```mermaid
flowchart TD
  Client["HTTP client / frontend / smoke test"]

  subgraph Routes["routes/dev-notes.routes.js"]
    Route["HTTP route handlers"]
    BodyRead["Read params / query / body"]
  end

  subgraph ResourceLayer["dev-notes resource layer"]
    Contract["resource contract\nfields, columns, nullability, writability"]
    Policies["operation policies\nget/list/search/create/replace/update/delete"]
    Validator["validator / normalizer\nraw input → command"]
  end

  subgraph ServiceLayer["dev-notes service / facade"]
    Service["use-case functions\nstorage selection + result status"]
    Port["repository port\nexpected storage capabilities"]
  end

  subgraph AdapterLayer["SQLite adapter layer"]
    SqliteShared["shared SQLite resource helpers\nschema SQL, projection, mapping, validation"]
    TempAdapter["temp SQLite adapter"]
    PersistentAdapter["persistent SQLite adapter"]
  end

  subgraph Storage["SQLite storage"]
    TempDb["temp DB/table"]
    PersistentDb["persistent DB/table"]
  end

  Client --> Route
  Route --> BodyRead
  BodyRead --> Validator

  Contract --> Validator
  Policies --> Validator

  Validator --> Service
  Service --> Port
  Port --> TempAdapter
  Port --> PersistentAdapter

  Contract --> SqliteShared
  SqliteShared --> TempAdapter
  SqliteShared --> PersistentAdapter

  TempAdapter --> TempDb
  PersistentAdapter --> PersistentDb
```

<details>

<summary>Core meaning</summary>

- Routes do HTTP.
- Validator turns unknown input into commands.
- Service/facade does use-case orchestration.
- Adapters do storage.
- Resource contract owns field truth.
- Shared SQLite helpers derive mechanical SQL/schema/mapping.

</details>

## Request → command → row → response flow

```mermaid
flowchart LR
  Raw["Raw HTTP input\nparams/query/body\nRecord<string, unknown>"]

  Command["Normalized command\nid + values + providedFields"]

  Service["Use-case result\ncreated / updated / deleted / not-found / invalid-request"]

  Repo["Repository call\nstorage operation"]

  Row["SQLite row\ncolumn names / nullable DB values"]

  Resource["Public API resource\nstable filled object"]

  Json["JSON response"]

  Raw -->|"validator + operation policy"| Command
  Command -->|"facade/service"| Service
  Service -->|"repository port"| Repo
  Repo -->|"SQL adapter"| Row
  Row -->|"mapper + output fallback"| Resource
  Resource -->|"route returnCodes"| Json
```

<details>

<summary>Important rule this captures</summary>

- Raw input is flexible.
- Command is normalized.
- DB row may contain nulls.
- Returned API resource is stable and filled.

So eg `comment` may be stored as `NULL`, but the API returns:

```json
{
  "comment": ""
}
```

</details>

## Operation policy diagram

```mermaid
flowchart TD
  Operation["Operation policy"]

  Get["getById\nrequires id\nno body"]
  List["list\nno id\nno body"]
  Search["search\nquery text\nno body"]
  Create["create\nbody required\nrequired: name\nwritable: name, comment"]
  Replace["replace\nrequires id\nrequired: name\nwritable: name, comment"]
  Update["update\nrequires id\nat least one field\nwritable: name, comment, lastConfirmedInteraction"]
  Delete["delete\nrequires id\nno body"]

  Operation --> Get
  Operation --> List
  Operation --> Search
  Operation --> Create
  Operation --> Replace
  Operation --> Update
  Operation --> Delete

  Contract["Resource contract\nfield definitions"] --> Operation

  Operation --> Validator["Generic command validator"]
```

<details>

<summary>Key abstraction</summary>

This is the key abstraction: the validator does not need hardcoded
name/comment/lastConfirmedInteraction logic. It gets allowed fields from the operation policy and
field rules from the contract.

</details>

## Ownership diagram

```mermaid
flowchart TD
  Contract["Resource contract"]

  Contract --> FieldTruth["Owns field truth\npublicName, columnName, type, nullable, writable"]
  Contract --> SqlTruth["Owns schema truth\nSQLite table + columns"]
  Contract --> OutputTruth["Owns output fallback rules\nnull → empty string, etc."]

  Routes["Routes"] --> RoutesOwn["Own HTTP concerns\nmethods, params, query, body extraction"]
  Validator["Validator"] --> ValidatorOwn["Owns input normalization\nunknown → command\nreject unknown/non-writable fields"]
  Service["Service/facade"] --> ServiceOwn["Owns use-case flow\nstorage selection, result statuses"]
  Adapter["Adapter"] --> AdapterOwn["Owns SQL execution\nqueries, transactions, DB errors"]
  Health["Health"] --> HealthOwn["Owns read-only readiness\nconnection + schema validation"]
  Tests["Smoke/tests"] --> TestsOwn["Own behavior checks\nCRUD, health, schema contract"]

  FieldTruth --> Validator
  SqlTruth --> Adapter
  SqlTruth --> Health
  SqlTruth --> Tests
  OutputTruth --> Adapter
```

<details>

<summary>Rule</summary>

- No layer invents field truth.
- They either consume the contract or handle their own boundary concern.

</details>

## Health boundary diagram

```mermaid
flowchart TD
  HealthRoute["GET /api/health/dev-notes"]

  HealthService["dev-notes health service"]

  subgraph HealthChecks["Read-only health checks"]
    Enabled["storage enabled?"]
    Connection["can open/reuse connection?"]
    Journal["journal mode valid/applied?"]
    Engine["SQLite proof query"]
    Schema["schema matches resource contract"]
  end

  subgraph NotHealth["Not health checks"]
    Crud["create/read/update/delete behavior"]
    Business["business validation semantics"]
    Frontend["frontend compatibility"]
  end

  HealthRoute --> HealthService
  HealthService --> Enabled
  HealthService --> Connection
  HealthService --> Journal
  HealthService --> Engine
  HealthService --> Schema

  Crud -. "covered by smoke tests" .-> NotHealth
  Business -. "covered by validator/service tests" .-> NotHealth
  Frontend -. "covered by frontend/API tests" .-> NotHealth
```

<details>

<summary>Health rule</summary>

- Health is read-only.
- Health validates dependency readiness.
- CRUD smoke validates behavior.

</details>

## Data shapes

- raw HTTP input
- normalized command
- repository input
- SQLite row
- public API resource

## Resource contract ownership

one place owns fields, column names, writability, nullability, output fallback

## What can be generic

- schema generation
- schema validation
- row mapping
- select aliases
- basic command validation
- safe dynamic PATCH SET clauses

## What stays explicit

- route semantics
- operation statuses
- storage selection
- search behavior
- timestamp behavior
- health summary policy

## Health model

- health is read-only
- health validates connection + schema
- CRUD smoke validates behavior
- health does not create/delete rows intentionally except normal DB init

## Test model

- schema contract test
- CRUD API smoke
- health smoke

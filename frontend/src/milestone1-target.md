# Milestone 1 Frontend Target State

## Frontend component inventory

### App shell

| Component    | Purpose                                    |
| ------------ | ------------------------------------------ |
| `App`        | Owns active page selection and app shell.  |
| `Tabs`       | Renders page navigation.                   |
| `PageHeader` | Displays page title and short description. |

### Layout

| Component | Purpose                         |
| --------- | ------------------------------- |
| `Card`    | Reusable visual card container. |
| `Section` | Groups related content.         |
| `Toolbar` | Horizontal action area.         |

### Feedback

| Component      | Purpose                                |
| -------------- | -------------------------------------- |
| `StatusCard`   | Displays one subsystem status.         |
| `JsonBlock`    | Displays raw JSON responses.           |
| `ErrorBox`     | Displays request or validation errors. |
| `LoadingBlock` | Displays loading state.                |
| `EmptyState`   | Displays empty result state.           |

### Feature views

| View                   | Purpose                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `LandingDashboardView` | Composes dashboard cards and latest persistent notes.             |
| `DevNotesCrudView`     | Composes storage selector, method panel, table and response view. |
| `HealthReportingView`  | Composes health summary cards and detailed JSON sections.         |

## View structure

```mermaid
flowchart TD
  App["App.jsx<br/>state: activePage<br/>methods: setActivePage()"]

  Tabs["Tabs.jsx<br/>props: pages, activePage, onSelectPage()"]

  LandingPage["LandingPage.jsx<br/>uses: useLandingDashboard()<br/>methods: refreshDashboard(), appendQuickNote()"]
  DevNotesCrudPage["DevNotesCrudPage.jsx<br/>uses: useDevNotesCrud()<br/>methods: runMethod(), refreshNotes()"]
  HealthReportingPage["HealthReportingPage.jsx<br/>uses: useHealthReporting()<br/>methods: refreshHealthReport(), toggleDetails()"]

  LandingView["LandingDashboardView.jsx<br/>props: statusCards, latestNotes, actions"]
  DevNotesCrudView["DevNotesCrudView.jsx<br/>props: storage, form, notes, lastResponse, actions"]
  HealthReportingView["HealthReportingView.jsx<br/>props: summary, details, rawResponses, actions"]

  StatusCard["StatusCard.jsx<br/>props: label, status, detail"]
  DevNotesTableView["DevNotesTableView.jsx<br/>props: notes, selectedId, onSelectNote()"]
  DevNotesMethodPanelView["DevNotesMethodPanelView.jsx<br/>props: form, storage, onChange(), onRunMethod()"]
  DevNotesResponseView["DevNotesResponseView.jsx<br/>props: lastResponse"]
  HealthSummaryView["HealthSummaryView.jsx<br/>props: cards"]
  HealthDetailView["HealthDetailView.jsx<br/>props: title, healthResult, isOpen, onToggle()"]
  JsonBlock["JsonBlock.jsx<br/>props: value"]

  App --> Tabs
  App --> LandingPage
  App --> DevNotesCrudPage
  App --> HealthReportingPage

  LandingPage --> LandingView
  DevNotesCrudPage --> DevNotesCrudView
  HealthReportingPage --> HealthReportingView

  LandingView --> StatusCard
  LandingView --> DevNotesTableView

  DevNotesCrudView --> DevNotesMethodPanelView
  DevNotesCrudView --> DevNotesTableView
  DevNotesCrudView --> DevNotesResponseView
  DevNotesResponseView --> JsonBlock

  HealthReportingView --> HealthSummaryView
  HealthReportingView --> HealthDetailView
  HealthReportingView --> JsonBlock
  HealthSummaryView --> StatusCard
  HealthDetailView --> JsonBlock
```

## Milestone 1 - Architecture

### Landing Page Sequence

```mermaid
sequenceDiagram
  actor User
  participant App
  participant LandingPage
  participant LandingDashboardView
  participant useLandingDashboard
  participant landingService
  participant healthApi
  participant devNotesApi
  participant Backend

  User->>App: opens frontend
  App->>LandingPage: render active page

  LandingPage->>useLandingDashboard: mount / initialize dashboard state
  useLandingDashboard->>landingService: loadLandingDashboard()

  landingService->>healthApi: fetchHealthSummary()
  healthApi->>Backend: GET /api/health
  Backend-->>healthApi: health summary

  landingService->>devNotesApi: listDevNotes("persistent")
  devNotesApi->>Backend: GET /api/dev-notes/persistent
  Backend-->>devNotesApi: persistent notes

  landingService-->>useLandingDashboard: dashboard model
  useLandingDashboard-->>LandingPage: state + actions
  LandingPage->>LandingDashboardView: status cards, latest notes, actions

  User->>LandingDashboardView: clicks quick append action
  LandingDashboardView->>useLandingDashboard: appendQuickNote()
  useLandingDashboard->>landingService: appendAToLatestPersistentNote()

  landingService->>devNotesApi: listDevNotes("persistent")
  devNotesApi->>Backend: GET /api/dev-notes/persistent
  Backend-->>devNotesApi: persistent notes

  alt latest persistent note exists
    landingService->>devNotesApi: updateDevNote("persistent", latestId, nextText)
    devNotesApi->>Backend: PATCH /api/dev-notes/persistent/:id
    Backend-->>devNotesApi: updated note
  else no persistent note exists
    landingService->>devNotesApi: createDevNote("persistent", "a")
    devNotesApi->>Backend: POST /api/dev-notes/persistent
    Backend-->>devNotesApi: created note
  end

  landingService->>healthApi: fetchHealthSummary()
  healthApi->>Backend: GET /api/health
  Backend-->>healthApi: health summary

  landingService->>devNotesApi: listDevNotes("persistent")
  devNotesApi->>Backend: GET /api/dev-notes/persistent
  Backend-->>devNotesApi: refreshed persistent notes

  landingService-->>useLandingDashboard: refreshed dashboard model
  useLandingDashboard-->>LandingDashboardView: updated state
```

### Dev-Notes CRUD Page Sequence

```mermaid
sequenceDiagram
  actor User
  participant App
  participant DevNotesCrudPage
  participant DevNotesCrudView
  participant useDevNotesCrud
  participant devNotesService
  participant devNotesApi
  participant Backend

  User->>App: selects DevNotes CRUD page
  App->>DevNotesCrudPage: render active page

  DevNotesCrudPage->>useDevNotesCrud: initialize CRUD state
  useDevNotesCrud-->>DevNotesCrudPage: state + actions
  DevNotesCrudPage->>DevNotesCrudView: storage, form, notes, lastResponse, actions

  User->>DevNotesCrudView: selects storage target
  DevNotesCrudView->>useDevNotesCrud: setStorage("temp" or "persistent")
  useDevNotesCrud->>devNotesService: loadDevNotes(storage)
  devNotesService->>devNotesApi: listDevNotes(storage)
  devNotesApi->>Backend: GET /api/dev-notes/:storage
  Backend-->>devNotesApi: notes
  devNotesService-->>useDevNotesCrud: normalized notes result
  useDevNotesCrud-->>DevNotesCrudView: updated notes + lastResponse

  User->>DevNotesCrudView: enters id/text
  DevNotesCrudView->>useDevNotesCrud: update form state

  User->>DevNotesCrudView: clicks method button
  DevNotesCrudView->>useDevNotesCrud: runMethod(method)

  useDevNotesCrud->>devNotesService: executeDevNotesMethod(method, storage, form)

  alt method is list
    devNotesService->>devNotesApi: listDevNotes(storage)
    devNotesApi->>Backend: GET /api/dev-notes/:storage
    Backend-->>devNotesApi: notes
  else method is search
    devNotesService->>devNotesApi: searchDevNotes(storage, text)
    devNotesApi->>Backend: GET /api/dev-notes/:storage?text=:text
    Backend-->>devNotesApi: matching notes
  else method is get by id
    devNotesService->>devNotesApi: getDevNote(storage, id)
    devNotesApi->>Backend: GET /api/dev-notes/:storage/:id
    Backend-->>devNotesApi: note or not-found
  else method is create
    devNotesService->>devNotesApi: createDevNote(storage, text)
    devNotesApi->>Backend: POST /api/dev-notes/:storage
    Backend-->>devNotesApi: created note
  else method is replace
    devNotesService->>devNotesApi: replaceDevNote(storage, id, text)
    devNotesApi->>Backend: PUT /api/dev-notes/:storage/:id
    Backend-->>devNotesApi: replaced note or not-found
  else method is update
    devNotesService->>devNotesApi: updateDevNote(storage, id, text)
    devNotesApi->>Backend: PATCH /api/dev-notes/:storage/:id
    Backend-->>devNotesApi: updated note or not-found
  else method is delete
    devNotesService->>devNotesApi: deleteDevNote(storage, id)
    devNotesApi->>Backend: DELETE /api/dev-notes/:storage/:id
    Backend-->>devNotesApi: deleted note or not-found
  else method is options
    devNotesService->>devNotesApi: getDevNotesOptions(storage, id?)
    devNotesApi->>Backend: OPTIONS /api/dev-notes/:storage/:id?
    Backend-->>devNotesApi: Allow header
  end

  devNotesService-->>useDevNotesCrud: normalized CRUD result
  useDevNotesCrud-->>DevNotesCrudView: updated notes + lastResponse + status
```

### Health Reporting Page sequence

```mermaid
sequenceDiagram
  actor User
  participant App
  participant HealthReportingPage
  participant HealthReportingView
  participant useHealthReporting
  participant healthService
  participant healthApi
  participant Backend

  User->>App: selects Health Reporting page
  App->>HealthReportingPage: render active page

  HealthReportingPage->>useHealthReporting: mount / initialize health state
  useHealthReporting->>healthService: loadHealthReport()

  healthService->>healthApi: fetchHealthSummary()
  healthApi->>Backend: GET /api/health
  Backend-->>healthApi: health summary

  healthService->>healthApi: fetchRuntimeHealth()
  healthApi->>Backend: GET /api/health/runtime
  Backend-->>healthApi: runtime health

  healthService->>healthApi: fetchPersistenceHealth({ details: "full" })
  healthApi->>Backend: GET /api/health/persistence?details=full
  Backend-->>healthApi: persistence health

  healthService->>healthApi: fetchDevNotesHealth({ details: "full" })
  healthApi->>Backend: GET /api/health/dev-notes?details=full
  Backend-->>healthApi: dev-notes health

  healthService-->>useHealthReporting: health report model
  useHealthReporting-->>HealthReportingPage: state + actions
  HealthReportingPage->>HealthReportingView: summary, details, raw responses, actions

  User->>HealthReportingView: toggles detail section
  HealthReportingView->>useHealthReporting: toggleDetails(sectionId)
  useHealthReporting-->>HealthReportingView: updated expanded/collapsed state

  User->>HealthReportingView: clicks refresh
  HealthReportingView->>useHealthReporting: refreshHealthReport()
  useHealthReporting->>healthService: loadHealthReport()

  healthService->>healthApi: fetchHealthSummary()
  healthApi->>Backend: GET /api/health
  Backend-->>healthApi: health summary

  healthService->>healthApi: fetchRuntimeHealth()
  healthApi->>Backend: GET /api/health/runtime
  Backend-->>healthApi: runtime health

  healthService->>healthApi: fetchPersistenceHealth({ details: "full" })
  healthApi->>Backend: GET /api/health/persistence?details=full
  Backend-->>healthApi: persistence health

  healthService->>healthApi: fetchDevNotesHealth({ details: "full" })
  healthApi->>Backend: GET /api/health/dev-notes?details=full
  Backend-->>healthApi: dev-notes health

  healthService-->>useHealthReporting: refreshed health report model
  useHealthReporting-->>HealthReportingView: updated state
```

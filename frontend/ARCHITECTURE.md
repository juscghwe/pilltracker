### Possible sequence

Reference:

```mermaid
sequenceDiagram
  participant User
  participant LandingPage
  participant useLandingDashboard
  participant landingService
  participant healthApi
  participant devNotesApi
  participant Backend

  User->>LandingPage: opens page
  LandingPage->>useLandingDashboard: mount
  useLandingDashboard->>landingService: load dashboard
  landingService->>healthApi: fetch health summary
  healthApi->>Backend: GET /api/health
  Backend-->>healthApi: health summary
  landingService->>devNotesApi: list persistent notes
  devNotesApi->>Backend: GET /api/dev-notes/persistent
  Backend-->>devNotesApi: notes
  landingService-->>useLandingDashboard: dashboard model
  useLandingDashboard-->>LandingPage: state
```

### Contract design

```mermaid
flowchart TD
  Pages["pages/<br/>top-level screens / future routes"]
  Hooks["hooks/<br/>React state + interaction flow"]
  Services["services/<br/>frontend use cases / orchestration"]
  Api["api/<br/>HTTP/backend communication"]

  Views["views/<br/>feature-specific composed UI"]
  Components["components/<br/>reusable dumb UI primitives"]

  Pages --> Hooks
  Pages --> Views
  Hooks --> Services
  Hooks --> Api
  Services --> Api
  Views --> Components

  Components -. forbidden .-> Api
  Components -. forbidden .-> Services
  Api -. forbidden .-> Hooks
  Api -. forbidden .-> Views
  Api -. forbidden .-> Components
  Services -. forbidden .-> Views
  Services -. forbidden .-> Components
  Views -. forbidden .-> Pages
```

- Higher layers may depend on lower layers.
- Lower layers must not depend on higher layers.
- Every boundary should either transform, hide technical details, own state or provide a stable
  abstraction.
- Blind re-export is suspicious.

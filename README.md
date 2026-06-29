# PillTracker

Self-hosted medication and supplement intake tracker for web, designed with future Android notification support and possible Home Assistant integration in mind.

PillTracker is built as a privacy-first alternative to medication tracking apps that depend on cloud services or third-party storage for sensitive health-related data.

## Project Status

> [!WARNING]
> Early development
>
> PillTracker is not production-ready and has no functional release yet.

The project has moved from pure planning into early implementation. Current work is focused on the M1 backend scaffold and the first vertical development slices.

Current status:

- [x] Project scope definition ([PSD](docs/PSD.md))
- [x] Software design documentation ([SDD](docs/SDD.md))
- [x] Development environment and repository workflow
- [x] Initial backend architecture planning
- [x] Backend health endpoint scaffold
- [x] SQLite persistence scaffold
- [ ] Generic CRUD proof slice
- [ ] Medication-domain CRUD
- [ ] Frontend scaffold
- [ ] Authentication and user model
- [ ] Encrypted backups

Active development happens on milestone and feature branches before being merged through PR back into `main`.

## Vision

Most common medication tracking apps require cloud services and store highly sensitive health-related data on third-party infrastructure.

PillTracker aims to provide a privacy-first, self-hosted alternative with:

- Medication and supplement reminders
- meal-relative schedules
- inventory tracking and refill planning
- multi-user / household support
- web-based administration
- strong reminders for critical medication
- encrypted backups
- future Android support
- possible future Home Assistant integration

## Planned Architecture

The current target architecture is:

- Frontend: React
- Backend: Node.js
- Database: SQLite
- Deployment: Docker / Docker Compose

## Development Roadmap

Current rough milestone direction:

1. M1: Backend scaffold, health checks, SQLite persistence, generic CRUD proof slice
2. M2: API shape and medication-domain backend behavior
3. M3: Frontend scaffold and basic administration UI
4. M4+: Medication schedules, reminders, inventory, users, backups, and integrations

This roadmap is intentionally iterative and may change as implementation reveals better boundaries.

## Documentation

- [Project scope definition](docs/PSD.md)
- [Software design documentation](docs/SDD.md)

Concrete implementation documentation can be found in the corresponding branches till they get merged into `main`.

## Contributing

The project is still early and primarily used as a learning and architecture project for now.

Feedback, ideas, architectural discussions, and issue comments are welcome. The codebase is not yet stable enough for production use.

## License

License to be determined.

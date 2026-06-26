# PillTracker

Self-hosted medication and supplement intake tracker for web, designed with Android and some times
in the future Home Assistant integration in mind.

1. [Project scope definition](docs/PSD.md)
2. [Software design documentation](docs/SDD.md)

## Project Status

> [!WARNING] Early development
>
> PillTracker is currently in the planning and architecture phase. No functional release is
> available yet.

Current focus:

- [x] Project scope definition ([#4](https://github.com/juscghwe/pilltracker/pull/4))
- [x] Software design documentation ([#5](https://github.com/juscghwe/pilltracker/pull/5))
- [ ] Development environment
- [ ] Repository workflow
- [ ] Architecture planning

## Vision

Most common medication tracking apps require cloud services and store highly sensitive
health-related data on third-party infrastructure.

I aim to provide a privacy-first, self-hosted alternative with:

- Medication and supplement reminders
- Inventory tracking and refill planning
- Multi-user support
- Android notifications
- Web-based administration
- Encrypted backups
- (future idea) Home Assistant integration

## Planned Architecture

- Frontend: React
- Backend: Node.js
- Database: SQLite
- Deployment: Docker

## Contributing

The project is currently in its early planning stage.

Feedback, ideas, architectural discussions and contributions are welcome.

## License

License to be determined.

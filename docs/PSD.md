# Project Scope Definition (PSD)

## Vision

- Self-hosted medication and supplement tracker
- Privacy-first: no external third-party analytics, no external trackers, etc
- No cloud hosting to not expose sensitive health data
- Support both required and optional intake schedules while remaining non-intrusive for non-critical routines

## Goals

- Provide web administration interface
- Provide multi-user support
- Track current inventory and estimated refill dates
- Track both required and optional intake schedules
- Provide non-intrusive reminders for optional intake
- Provide escalating reminders for critical medication
- Support meal-relative medication schedules
- Support privacy-aware notifications
- Minimize user interaction required for routine tracking

## Target users

- Persons with regular medication schedules (incl. birth control)
- Persons with regular supplementation schedules
- Families managing medication for children or relatives
- Privacy-conscious self-hosters

## MVP

- Medication management
- Inventory management
- Single-user authentication
- Web interface (non administrative)
- Encrypted backups
- Browser-based notifications (in UI)
- Docker deployment

## Stretch goals

Lvl 1:
- TOTP for login
- Android app & notification handling

Lvl 2:
- HA OS integration
- Fingerprint auth for Android app
- Parental / Family mode (parents can review medication success of their children)

## Out of scope

- Medical advice
- Prescription management
- Medication interaction checking
- Cloud hosting, user telemetry and usage analytics
- iOS app (no iOS env)

## Success criteria

- User can distinguish between critical and optional intake schedules
- User can manage medication schedules without cloud services
- User can track medication inventory and refill needs
- User can receive and acknowledge reminders
- All core functionality is deployable via Docker
- Medication data remains stored locally under user control

# Repository scripts

## Purpose

This directory contains repository maintenance scripts used by npm commands.

The scripts provide small workflow wrappers around formatting, linting, and pre-commit validation.

They are intentionally lightweight. Project behavior should not live here unless it is part of
repository maintenance or developer workflow.

## Public commands

The public entrypoints are npm scripts from the root `package.json`.

| Command             | Script                   | Purpose                                 |
| ------------------- | ------------------------ | --------------------------------------- |
| `npm run check`     | `scripts/check.mjs`      | Check repository formatting and linting |
| `npm run fix`       | `scripts/fix.mjs`        | Apply formatting and run linting        |
| `npm run precommit` | `scripts/pre-commit.mjs` | Check staged files before commit        |

## `check.mjs`

Runs repository-wide validation.

```bash
npm run repo:format:check
npm run repo:lint
```

Use this before opening or updating a PR:

```bash
npm run check
```

`npm run check` checks formatting and linting only.

It does not run smoke tests, frontend builds or backend startup checks.

## `fix.mjs`

Runs repository-wide auto-fix helpers where available.

```bash
npm run repo:format
npm run repo:lint
```

Use this when formatting needs to be applied:

```bash
npm run fix
```

Linting currently runs after formatting, but the lint command is not documented as an auto-fixer.

## `pre-commit.mjs`

Checks staged files before commit.

The script reads staged files with Git and only runs relevant checks for files that are currently
staged.

> [!NOTE]
>
> This check gets executed on file level. If a document is staged, it will execute on the entire
> file, not just the changes. This might get fixed in the future.

Current staged-file checks:

| File type                                                    | Check          |
| ------------------------------------------------------------ | -------------- |
| `js`, `mjs`, `jsx`, `json`, `md`, `yaml`, `yml`              | Prettier check |
| `backend/**/*.js`, `backend/**/*.mjs`, `backend/**/*.jsx`    | ESLint         |
| `frontend/**/*.js`, `frontend/**/*.mjs`, `frontend/**/*.jsx` | ESLint         |
| `scripts/**/*.js`, `scripts/**/*.mjs`, `scripts/**/*.jsx`    | ESLint         |

If no staged files need formatting or linting checks, the script exits successfully.

Run manually with:

```bash
npm run precommit
```

## Shared command runner

### `runCommands()`

```js
import { runCommands } from "./lib/run-commands.mjs";
```

`runCommands()` runs command definitions sequentially.

Each command has this shape:

```js
{
  name: string,
  executable: string,
  args: string[],
}
```

For each command, it prints the command name, runs the executable, and stops on failure.

Failure behavior:

- throws if spawning the process fails
- exits with the failing command status if the command returns a non-zero status

This helper is intended for repository maintenance scripts, not application runtime code.

## Script ownership rules

Scripts may

- compose npm commands
- run developer workflow checks
- inspect staged files
- provide small workflow helpers

Scripts should not

- contain backend application logic
- contain frontend application logic
- hide validation behavior that should be visible in `package.json`
- replace dedicated tests

If a script starts becoming complex, split the behavior into a focused helper and document the
public command here.

## Adding scripts

When adding a new repository script:

1. add the public command to `package.json`
2. keep the script focused on one workflow
3. reuse `runCommands()` for sequential command execution wherever useful
4. document the command in this README
5. include the command in PR validation notes if contributors should run it

## Validation before PR

Before opening or updating a PR, run:

```bash
npm run check
```

For backend behavior changes, also run:

```bash
npm run test:backend:smoke
```

For frontend build changes, also run:

```bash
npm run test:frontend:build
```

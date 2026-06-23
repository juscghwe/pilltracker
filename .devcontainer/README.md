# Dev Container

This folder contains the VS Code Dev Container setup for the repository.

The dev container provides a reproducible development environment for working on PillTracker without installing the full Node.js toolchain directly on the host system.

For general background, see the official Dev Containers documentation:

- Dev Containers specification: [https://containers.dev/](https://containers.dev/)
- VS Code Dev Containers: [https://code.visualstudio.com/docs/devcontainers/containers](https://code.visualstudio.com/docs/devcontainers/containers)

## What is included

> [!Note]
>
> The dev container is intended for development only, not deployment.

It provides:

- Node.js development environment
- Git support
- SQLite tooling
- VS Code extension recommendations
- access to the project workspace
- automatic Git hook setup through `postCreateCommand`

The Git hook setup enables the repository pre-commit hook:

```sh
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

This means commits made inside the Dev Container run the repository quality checks before Git accepts the commit.

> [!Warning]
>
> The Dev Container is not the production runtime environment.
>
> Do not treat this container as the deployment image.
>
> Production deployment should always use a dedicated runtime Dockerfile / image that installs only runtime dependencies and starts the application with the normal `start` command.

## Network access

The Dev Container runs with host networking. This allows tools inside the Dev Container to access services published by Docker Compose through `localhost`.

Example:

```sh
docker compose up -d app
curl http://localhost:3000/api/health
```

The application container still runs as a normal Docker Compose service and publishes `port 3000` to the Docker host.

This setup is set up for development VM workflow. Other environments, especially Docker Desktop on Windows / macOS, may behave differently.

## Possible ways to work on the project

### Recommended: VS Code Dev Containers

Open the repository in VS Code and choose:

```
Dev Containers: Reopen in Container
```

This uses the configuration in this folder.

You can use this container

- within a VM, e.g. a dedicated Development VM, as remote host,
- as a standalone Docker container on a remote host,
- as a standalone Docker container on your local Docker Socket, e.g. Docker Desktop on Windows / macOS.

VS Code will install only the `Dev Containers` extension (plus `Remote` extensions if you work with a remote host). All other recommended extensions will get installed into the Dev Container and used from there just like the toolchains.

Removing the Dev Container removes the container-installed dependencies, toolchains and extensions. Docker may still keep images, volumes or build cache until they are pruned manually.

### Not tested: GitHub Codespaces

This setup may also be usable with GitHub Codespaces because Codespaces supports dev container configuration. Any Codespaces-specific adjustments should be documented when they are added.

## Notes for contributors

Formatting and linting commands are defined in the root `package.json`.

The Dev Container only activates the local Git hook. The actual quality checks are project-level npm scripts so they can also be used by:

- local terminal commands
- Git hooks
- GitHub Actions
- other development environments

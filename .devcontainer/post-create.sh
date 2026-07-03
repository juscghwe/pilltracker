#!/usr/bin/env bash
set -euo pipefail

npm ci

git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
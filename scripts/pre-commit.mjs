import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

import { runCommands } from "./lib/run-commands.mjs";

function getStagedFiles() {
  const result = spawnSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"], {
    encoding: "utf8",
    shell: process.platform === "win32",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  return result.stdout
    .split("\0")
    .filter(Boolean)
    .filter((file) => existsSync(file));
}

const stagedFiles = getStagedFiles();

const prettierFiles = stagedFiles.filter((file) => /\.(js|mjs|jsx|json|md|yaml|yml)$/.test(file));

const eslintFiles = stagedFiles.filter((file) =>
  /^(backend|frontend|scripts)\/.*\.(js|mjs|jsx)$/.test(file),
);

console.log("Checking staged files before commit...");

const commands = [];

if (prettierFiles.length > 0) {
  commands.push({
    name: "Check formatting for staged files",
    executable: "npm",
    args: ["exec", "--", "prettier", "--check", ...prettierFiles],
  });
}

if (eslintFiles.length > 0) {
  commands.push({
    name: "Run linting for staged files",
    executable: "npm",
    args: ["exec", "--", "eslint", ...eslintFiles],
  });
}

if (commands.length === 0) {
  console.log("No staged files need formatting or linting checks.");
  process.exit(0);
}

runCommands(commands);

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createInterface } from "node:readline/promises";

const npmExecutable = process.platform === "win32" ? "npm.cmd" : "npm";

/**
 * @typedef {object} CommandResult
 * @property {number | null} status Process exit status.
 * @property {Error | undefined} error Process execution error.
 */

/**
 * Returns staged files that still exist in the working tree.
 *
 * @returns {string[]} Staged file paths.
 */
function getStagedFiles() {
  const result = spawnSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"], {
    encoding: "utf8",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    console.error("Could not determine staged files.");
    process.exit(result.status ?? 1);
  }

  return result.stdout
    .split("\0")
    .filter(Boolean)
    .filter((file) => existsSync(file));
}

/**
 * Runs one command while preserving its terminal output.
 *
 * @param {string} name Human-readable check name.
 * @param {string} executable Executable name.
 * @param {string[]} args Command arguments.
 * @returns {CommandResult} Process result.
 */
function runCommand(name, executable, args) {
  console.log(`\n> ${name}`);

  const result = spawnSync(executable, args, {
    stdio: "inherit",
  });

  return {
    status: result.status,
    error: result.error,
  };
}

/**
 * Exits when a tool could not be executed.
 *
 * @param {string} toolName Tool name.
 * @param {CommandResult} result Process result.
 * @returns {void}
 */
function assertToolExecuted(toolName, result) {
  if (!result.error && result.status !== null) {
    return;
  }

  console.error(`\n✖ ${toolName} could not be executed.`);

  if (result.error) {
    console.error(result.error.message);
  }

  process.exit(1);
}

/**
 * Asks whether a formatting-only failure should be ignored.
 *
 * @returns {Promise<boolean>} Whether the commit should continue.
 */
async function confirmFormattingOverride() {
  if (process.env.PILLTRACKER_ALLOW_FORMATTING_WARNINGS === "1") {
    console.warn("\n⚠ Continuing because PILLTRACKER_ALLOW_FORMATTING_WARNINGS=1 is set.");
    return true;
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.error(`
✖ Formatting differences were found, but interactive confirmation is unavailable.

To commit from a terminal while allowing formatting differences, run:

  PILLTRACKER_ALLOW_FORMATTING_WARNINGS=1 git commit

This override only ignores Prettier differences. ESLint errors still block the commit.
`);

    return false;
  }

  const prompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answer = await prompt.question(
      "\n⚠ Prettier found formatting differences. Commit anyway? [y/N] ",
    );

    return /^(y|yes)$/i.test(answer.trim());
  } finally {
    prompt.close();
  }
}

const stagedFiles = getStagedFiles();

const prettierFiles = stagedFiles.filter((file) => /\.(js|mjs|jsx|json|md|yaml|yml)$/.test(file));

const eslintFiles = stagedFiles.filter((file) =>
  /^(backend|frontend|scripts)\/.*\.(js|mjs|jsx)$/.test(file),
);

console.log("Checking staged files before commit...");

if (prettierFiles.length === 0 && eslintFiles.length === 0) {
  console.log("No staged files need formatting or linting checks.");
  process.exit(0);
}

let prettierHasDifferences = false;

if (prettierFiles.length > 0) {
  const prettierResult = runCommand("Check formatting for staged files", npmExecutable, [
    "exec",
    "--",
    "prettier",
    "--check",
    ...prettierFiles,
  ]);

  assertToolExecuted("Prettier", prettierResult);

  if (prettierResult.status === 1) {
    prettierHasDifferences = true;
  } else if (prettierResult.status !== 0) {
    console.error(`\n✖ Prettier failed unexpectedly with exit code ${prettierResult.status}.`);
    process.exit(prettierResult.status ?? 1);
  }
}

if (eslintFiles.length > 0) {
  const eslintResult = runCommand("Run linting for staged files", npmExecutable, [
    "exec",
    "--",
    "eslint",
    ...eslintFiles,
  ]);

  assertToolExecuted("ESLint", eslintResult);

  if (eslintResult.status === 1) {
    console.error(`
✖ ESLint found error-level problems.

Warnings are allowed, but ESLint errors must be fixed before committing.
`);
    process.exit(1);
  }

  if (eslintResult.status !== 0) {
    console.error(`\n✖ ESLint failed unexpectedly with exit code ${eslintResult.status}.`);
    process.exit(eslintResult.status ?? 1);
  }
}

if (prettierHasDifferences) {
  const continueCommit = await confirmFormattingOverride();

  if (!continueCommit) {
    console.error("\nCommit cancelled.");
    process.exit(1);
  }
}

console.log("\n✓ Pre-commit checks completed.");

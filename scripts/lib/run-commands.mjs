import { spawnSync } from "node:child_process";

/**
 * @typedef {object} CommandDefinition
 * @property {string} name Human-readable command name printed before execution.
 * @property {string} executable Executable passed to `spawnSync`.
 * @property {string[]} args Arguments passed to the executable.
 */

/**
 * Runs shell commands sequentially and exits on the first failed command.
 *
 * @param {CommandDefinition[]} commands Commands to run.
 * @returns {void}
 */
export function runCommands(commands) {
  for (const command of commands) {
    console.log(`\n> ${command.name}`);

    const result = spawnSync(command.executable, command.args, {
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    if (result.error) {
      throw result.error;
    }

    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }
  }
}

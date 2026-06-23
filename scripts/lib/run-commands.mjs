import { spawnSync } from "node:child_process";

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

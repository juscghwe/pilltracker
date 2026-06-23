import { runCommands } from "./lib/run-commands.mjs";

runCommands([
  {
    name: "Check formatting",
    executable: "npm",
    args: ["run", "repo:format:check"],
  },
  {
    name: "Run linting",
    executable: "npm",
    args: ["run", "repo:lint"],
  },
]);

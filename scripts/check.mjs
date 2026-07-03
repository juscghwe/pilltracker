import { runCommands } from "./lib/run-commands.mjs";

runCommands([
  {
    name: "Check formatting",
    executable: "npm",
    args: ["run", "repo:format:check"],
  },
  {
    name: "Run typechecks",
    executable: "npm",
    args: ["run", "typecheck"],
  },
  {
    name: "Run linting",
    executable: "npm",
    args: ["run", "repo:lint"],
  },
]);

import { runCommands } from "./lib/run-commands.mjs";

runCommands([
  {
    name: "Fix formatting",
    executable: "npm",
    args: ["run", "repo:format"],
  },
  {
    name: "Run linting",
    executable: "npm",
    args: ["run", "repo:lint"],
  },
]);

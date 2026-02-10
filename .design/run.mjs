\
#!/usr/bin/env node
import { run } from "./scripts/runner.mjs";

const args = process.argv.slice(2);
const target = (args[0] || "target").trim();

const phaseArg = (() => {
  const idx = args.indexOf("--phase");
  if (idx !== -1) return args[idx + 1];
  return null;
})();

const resume = args.includes("--resume");

await run({
  cwd: process.cwd(),
  target,
  phase: phaseArg || "all",
  resume
});

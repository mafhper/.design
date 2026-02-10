\
import path from "node:path";
import { ensureDir, exists, readText, writeText, safeRel } from "./lib/fs.mjs";
import { initFlow } from "./flows/init-flow.mjs";
import { baselineFlow } from "./flows/baseline-flow.mjs";
import { iterateFlow } from "./flows/iterate-flow.mjs";
import { specFlow } from "./flows/spec-flow.mjs";
import { planFlow } from "./flows/plan-flow.mjs";

const FLOW_ORDER = ["init", "baseline", "iterate", "spec", "plan"];

function nowISO() { return new Date().toISOString(); }

function loadJob(statePath) {
  if (!exists(statePath)) return null;
  try { return JSON.parse(readText(statePath)); } catch { return null; }
}

function saveJob(statePath, job) {
  writeText(statePath, JSON.stringify(job, null, 2));
}

function shouldRunPhase(requested, phase) {
  if (!requested || requested === "all") return true;
  return requested === phase;
}

export async function run({ cwd, target, phase = "all", resume = false }) {
  const designDir = path.join(cwd, ".design");
  const stateDir = path.join(designDir, "state");
  ensureDir(stateDir);

  const statePath = path.join(stateDir, `${target}.job.json`);

  const existing = resume ? loadJob(statePath) : null;

  const job = existing || {
    version: "v5",
    target,
    created_at: nowISO(),
    updated_at: nowISO(),
    stack: null,
    status: {
      init: "pending",
      baseline: "pending",
      iterate: "pending",
      spec: "pending",
      plan: "pending",
      awaiting: null
    },
    artifacts: []
  };

  const ctx = { cwd, target, designDir, stack: job.stack, status: job.status, artifacts: job.artifacts };

  // Bootstrap dirs (idempotent)
  const dirs = [
    path.join(designDir, "init"),
    path.join(designDir, "baselines"),
    path.join(designDir, "candidates", target),
    path.join(designDir, "plans"),
    path.join(designDir, "qa"),
    path.join(designDir, "specs", "pages"),
    path.join(designDir, "specs", "components"),
    path.join(designDir, "templates"),
    path.join(designDir, "scripts"),
    path.join(designDir, "state"),
  ];
  dirs.forEach(ensureDir);

  // Execute flows in order
  if (shouldRunPhase(phase, "init")) await initFlow(ctx);
  if (shouldRunPhase(phase, "baseline")) await baselineFlow(ctx);
  if (shouldRunPhase(phase, "iterate")) await iterateFlow(ctx);
  if (shouldRunPhase(phase, "spec")) await specFlow(ctx);
  if (shouldRunPhase(phase, "plan")) await planFlow(ctx);

  job.stack = ctx.stack;
  job.status = ctx.status;
  job.artifacts = Array.from(new Set(ctx.artifacts)); // unique
  job.updated_at = nowISO();

  saveJob(statePath, job);

  // Output summary
  console.log("✅ .design job runner concluído.");
  console.log("Target:", target);
  console.log("Phase:", phase, "Resume:", resume);
  console.log("Job state:", safeRel(cwd, statePath));
  console.log("\nArtefatos:");
  for (const a of job.artifacts.slice(0, 30)) console.log("-", a);
  if (job.artifacts.length > 30) console.log(`- ... (+${job.artifacts.length - 30} itens)`);

  if (job.status.awaiting === "user_decision") {
    console.log("\n⚠️ Próximo passo (agente): preencher candidatos/scorecard e conversar com o usuário.");
    console.log(`- ${safeRel(cwd, path.join(designDir, "candidates", target, "decision.md"))}`);
  }
}

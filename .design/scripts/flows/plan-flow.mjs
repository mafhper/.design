\
import path from "node:path";
import { ensureDir, exists, readText, writeText, safeRel } from "../lib/fs.mjs";

export async function planFlow(ctx) {
  const { cwd, designDir, target } = ctx;
  const planDir = path.join(designDir, "plans");
  ensureDir(planDir);

  const tpl = path.join(designDir, "templates", "implementation-plan.template.md");
  const planTpl = exists(tpl) ? readText(tpl) : "# Implementation Plan — <alvo>\n";
  const planPath = path.join(planDir, `${target}-implementation-plan.md`);
  if (!exists(planPath)) writeText(planPath, planTpl.replaceAll("<alvo>", target));

  ctx.artifacts.push(safeRel(cwd, planPath));
  ctx.status.plan = "done";
  return ctx;
}

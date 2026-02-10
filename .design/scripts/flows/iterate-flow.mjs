\
import path from "node:path";
import { ensureDir, exists, readText, writeText, safeRel } from "../lib/fs.mjs";

function fill(tpl, map) {
  let out = tpl;
  for (const [k,v] of Object.entries(map)) out = out.replaceAll(k, v);
  return out;
}

export async function iterateFlow(ctx) {
  const { cwd, designDir, target } = ctx;
  const candDir = path.join(designDir, "candidates", target);
  ensureDir(candDir);

  const tplDir = path.join(designDir, "templates");
  const candTpl = exists(path.join(tplDir, "candidate.template.md")) ? readText(path.join(tplDir, "candidate.template.md")) : "# <candidate> — <alvo>\n";
  const scoreTpl = exists(path.join(tplDir, "scorecard.template.md")) ? readText(path.join(tplDir, "scorecard.template.md")) : "# Scorecard — <alvo>\n";
  const decisionTpl = exists(path.join(tplDir, "decision.template.md")) ? readText(path.join(tplDir, "decision.template.md")) : "# Decision — <alvo>\n";

  const v1 = path.join(candDir, "v1-minimal.md");
  const v2 = path.join(candDir, "v2-systematic.md");
  const v3 = path.join(candDir, "v3-bold.md");
  const sc = path.join(candDir, "scorecard.md");
  const decision = path.join(candDir, "decision.md");

  if (!exists(v1)) writeText(v1, fill(candTpl, {"<candidate>":"v1-minimal","<alvo>":target}));
  if (!exists(v2)) writeText(v2, fill(candTpl, {"<candidate>":"v2-systematic","<alvo>":target}));
  if (!exists(v3)) writeText(v3, fill(candTpl, {"<candidate>":"v3-bold","<alvo>":target}));
  if (!exists(sc)) writeText(sc, fill(scoreTpl, {"<alvo>":target}));
  if (!exists(decision)) writeText(decision, fill(decisionTpl, {"<alvo>":target}));

  ctx.artifacts.push(
    safeRel(cwd, v1), safeRel(cwd, v2), safeRel(cwd, v3),
    safeRel(cwd, sc), safeRel(cwd, decision)
  );
  ctx.status.iterate = "done";
  ctx.status.awaiting = "user_decision";
  return ctx;
}

\
import path from "node:path";
import { ensureDir, exists, writeText, safeRel } from "../lib/fs.mjs";

export async function baselineFlow(ctx) {
  const { cwd, designDir, target } = ctx;
  const baseDir = path.join(designDir, "baselines");
  ensureDir(baseDir);

  const html = path.join(baseDir, `${target}.before.html`);
  const jsn = path.join(baseDir, `${target}.before.json`);

  if (!exists(html)) {
    writeText(html, `<!-- Baseline BEFORE: ${target}\nCole aqui um snapshot HTML fiel do estado atual (antes do redesign).\nDica: copie do HTML renderizado em runtime (happy path).\n-->\n`);
  }
  if (!exists(jsn)) {
    writeText(jsn, JSON.stringify({ page: target, viewport: ["mobile","desktop"], tree: [], tokens_used: [] }, null, 2));
  }

  ctx.artifacts.push(safeRel(cwd, html), safeRel(cwd, jsn));
  ctx.status.baseline = "done";
  return ctx;
}

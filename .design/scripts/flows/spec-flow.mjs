\
import path from "node:path";
import { ensureDir, exists, readText, writeText, safeRel } from "../lib/fs.mjs";

export async function specFlow(ctx) {
  const { cwd, designDir, target } = ctx;
  const specDir = path.join(designDir, "specs", "pages");
  ensureDir(specDir);

  const tpl = path.join(designDir, "templates", "spec-page.template.md");
  const specTpl = exists(tpl) ? readText(tpl) : "# Redesign Spec — <alvo>\n";
  const specPath = path.join(specDir, `${target}.redesign.md`);
  if (!exists(specPath)) writeText(specPath, specTpl.replaceAll("<alvo>", target));

  ctx.artifacts.push(safeRel(cwd, specPath));
  ctx.status.spec = "done";
  return ctx;
}

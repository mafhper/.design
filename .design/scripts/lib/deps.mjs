\
import path from "node:path";
import { exists, readText } from "./fs.mjs";

export function parseImports(txt) {
  const out = [];
  const re = /import\s+(?:[^'"]+\s+from\s+)?["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(txt))) out.push(m[1]);
  return out;
}

export function loadTsconfigPaths(cwd) {
  const candidates = ["tsconfig.json", "tsconfig.base.json"];
  for (const rel of candidates) {
    const p = path.join(cwd, rel);
    if (!exists(p)) continue;
    try {
      const obj = JSON.parse(readText(p));
      return (obj.compilerOptions && obj.compilerOptions.paths) || {};
    } catch {}
  }
  return {};
}

function resolveWithExt(base) {
  const exts = [".ts",".tsx",".js",".jsx",".css"];
  if (exists(base)) return base;
  for (const ext of exts) if (exists(base + ext)) return base + ext;
  for (const ext of exts) {
    const idx = path.join(base, "index" + ext);
    if (exists(idx)) return idx;
  }
  return null;
}

export function resolveImport(cwd, spec, fromFile, tsPaths) {
  if (spec.startsWith(".")) {
    return resolveWithExt(path.resolve(path.dirname(fromFile), spec));
  }
  if (spec.startsWith("@/")) {
    return resolveWithExt(path.resolve(cwd, "src", spec.slice(2)));
  }
  for (const [alias, targets] of Object.entries(tsPaths || {})) {
    const star = alias.indexOf("*");
    if (star === -1) continue;
    const pre = alias.slice(0, star);
    const post = alias.slice(star + 1);
    if (spec.startsWith(pre) && spec.endsWith(post)) {
      const mid = spec.slice(pre.length, spec.length - post.length);
      const t0 = (targets && targets[0]) || "";
      const tStar = t0.indexOf("*");
      const replaced = tStar === -1 ? t0 : t0.replace("*", mid);
      return resolveWithExt(path.resolve(cwd, replaced));
    }
  }
  return null;
}

export function buildDependencyTree(cwd, entry, tsPaths) {
  const seen = new Set();
  const lines = [];

  function walk(file, indent) {
    if (!file || seen.has(file)) return;
    seen.add(file);
    lines.push(`${"  ".repeat(indent)}- ${path.relative(cwd, file).replaceAll("\\", "/")}`);

    let txt = "";
    try { txt = readText(file); } catch { return; }
    const imps = parseImports(txt)
      .filter(s => !s.startsWith("react") && !s.startsWith("next") && !s.startsWith("@radix-ui") && !s.startsWith("clsx") && !s.startsWith("lodash"))
      .filter(s => !s.startsWith("http"));
    for (const spec of imps) {
      const r = resolveImport(cwd, spec, file, tsPaths);
      if (r && r.startsWith(cwd)) walk(r, indent + 1);
    }
  }

  walk(entry, 0);
  return lines.join("\n");
}

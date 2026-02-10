\
import fs from "node:fs";
import path from "node:path";

export function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
export function exists(p) { try { fs.accessSync(p); return true; } catch { return false; } }
export function readText(p) { return fs.readFileSync(p, "utf-8"); }
export function writeText(p, s) { ensureDir(path.dirname(p)); fs.writeFileSync(p, s, "utf-8"); }
export function safeRel(cwd, p) { return path.relative(cwd, p).replaceAll("\\", "/"); }
export function fence(lang, code) { return `\n\n\`\`\`${lang}\n${code}\n\`\`\`\n`; }

export function listFilesRecursive(root, exts) {
  const out = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let items = [];
    try { items = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const it of items) {
      const p = path.join(dir, it.name);
      if (it.isDirectory()) {
        if (["node_modules",".git",".next","dist","build","coverage"].includes(it.name)) continue;
        stack.push(p);
      } else if (it.isFile()) {
        const ext = path.extname(it.name).toLowerCase();
        if (!exts || exts.includes(ext)) out.push(p);
      }
    }
  }
  return out;
}

export function findFirst(cwd, rels) {
  for (const rel of rels) {
    const p = path.join(cwd, rel);
    if (exists(p)) return p;
  }
  return null;
}

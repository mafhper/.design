\
import path from "node:path";
import { exists, listFilesRecursive } from "./fs.mjs";

export function discoverPages(cwd) {
  const out = [];
  const app1 = path.join(cwd, "src", "app");
  const app2 = path.join(cwd, "app");
  const pages1 = path.join(cwd, "src", "pages");
  const pages2 = path.join(cwd, "pages");

  const rootApp = exists(app1) ? app1 : exists(app2) ? app2 : null;
  const rootPages = exists(pages1) ? pages1 : exists(pages2) ? pages2 : null;

  if (rootApp) {
    const files = listFilesRecursive(rootApp, [".tsx", ".ts", ".jsx", ".js"]);
    for (const f of files) {
      const bn = path.basename(f);
      if (bn === "page.tsx" || bn === "page.jsx") out.push(f);
    }
  } else if (rootPages) {
    const files = listFilesRecursive(rootPages, [".tsx", ".ts", ".jsx", ".js"]);
    for (const f of files) {
      const bn = path.basename(f);
      if (bn.startsWith("_")) continue;
      out.push(f);
    }
  }
  return out.slice(0, 10);
}

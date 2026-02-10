\
import path from "node:path";
import { ensureDir, exists, readText, writeText, fence, listFilesRecursive, findFirst, safeRel } from "../lib/fs.mjs";
import { detectStack } from "../lib/stack.mjs";
import { discoverPages } from "../lib/pages.mjs";
import { buildDependencyTree, loadTsconfigPaths } from "../lib/deps.mjs";

export async function initFlow(ctx) {
  const { cwd, designDir } = ctx;
  const stack = detectStack(cwd);
  ctx.stack = stack;

  const initDir = path.join(designDir, "init");
  ensureDir(initDir);

  // theme.md
  const globals = findFirst(cwd, ["src/styles/globals.css","src/globals.css","styles/globals.css","src/index.css","src/app/globals.css","app/globals.css"]);
  const tw = findFirst(cwd, ["tailwind.config.ts","tailwind.config.js","tailwind.config.cjs","tailwind.config.mjs"]);
  const themeOut = path.join(initDir, "theme.md");
  let themeMd = `# theme.md\n\nFramework: ${stack.framework}\nCSS: ${stack.css}\nUI: ${stack.ui}\n`;
  if (tw) themeMd += `\n## tailwind config\nPath: \`${safeRel(cwd, tw)}\`\n` + fence(path.extname(tw).slice(1) || "txt", readText(tw));
  if (globals) themeMd += `\n## globals css\nPath: \`${safeRel(cwd, globals)}\`\n` + fence("css", readText(globals));
  if (!exists(themeOut) || readText(themeOut).trim().length < 40) writeText(themeOut, themeMd);

  // components.md
  const compOut = path.join(initDir, "components.md");
  const primDirs = ["src/components/ui","components/ui","src/ui","packages/ui/src"].map(r => path.join(cwd, r)).filter(exists);
  let compMd = "# components.md\n\nPrimitives directories (heuristic):\n" + primDirs.map(d => `- \`${safeRel(cwd, d)}\``).join("\n") + "\n";
  const primFiles = primDirs.flatMap(d => listFilesRecursive(d, [".tsx",".ts",".jsx",".js"])).slice(0, 60);
  for (const f of primFiles) compMd += `\n\n## ${path.basename(f)}\nPath: \`${safeRel(cwd, f)}\`\n` + fence(path.extname(f).slice(1), readText(f));
  if (!exists(compOut) || readText(compOut).trim().length < 50) writeText(compOut, compMd);

  // layouts.md
  const layOut = path.join(initDir, "layouts.md");
  const srcRoot = exists(path.join(cwd, "src")) ? path.join(cwd, "src") : cwd;
  const all = listFilesRecursive(srcRoot, [".tsx",".ts",".jsx",".js"]);
  const layoutFiles = all.filter(f => /(layout|shell|header|sidebar|footer|navbar|nav)\.(t|j)sx?$|\/(layout|layouts)\//i.test(f)).slice(0, 40);
  let layMd = "# layouts.md\n";
  for (const f of layoutFiles) layMd += `\n\n## ${path.basename(f)}\nPath: \`${safeRel(cwd, f)}\`\n` + fence(path.extname(f).slice(1), readText(f));
  if (!exists(layOut) || readText(layOut).trim().length < 50) writeText(layOut, layMd);

  // routes.md
  const routesOut = path.join(initDir, "routes.md");
  const routerCfg = findFirst(cwd, ["src/routes.ts","src/router.ts","src/router/index.ts","src/router/index.tsx","src/app/router.ts"]);
  let routesMd = `# routes.md\n\nFramework: ${stack.framework}\n`;
  if (routerCfg) routesMd += `\n## Router config\nPath: \`${safeRel(cwd, routerCfg)}\`\n` + fence(path.extname(routerCfg).slice(1), readText(routerCfg));
  const discovered = discoverPages(cwd);
  if (discovered.length) routesMd += `\n## Discovered page entries (heuristic)\n` + discovered.map(p => `- \`${safeRel(cwd, p)}\``).join("\n") + "\n";
  if (!exists(routesOut) || readText(routesOut).trim().length < 40) writeText(routesOut, routesMd);

  // pages.md (dependency trees)
  const pagesOut = path.join(initDir, "pages.md");
  const tsPaths = loadTsconfigPaths(cwd);
  const pages = discoverPages(cwd);
  let pagesMd = "# pages.md\n\nThis file is the SINGLE SOURCE OF TRUTH for dependencies.\n";
  for (const entry of pages) {
    const slug = safeRel(cwd, entry);
    pagesMd += `\n\n## ${slug}\nEntry: ${slug}\nDependencies:\n`;
    pagesMd += buildDependencyTree(cwd, entry, tsPaths) + "\n";
  }
  if (!exists(pagesOut) || readText(pagesOut).trim().length < 80) writeText(pagesOut, pagesMd);

  ctx.artifacts.push(
    safeRel(cwd, themeOut),
    safeRel(cwd, compOut),
    safeRel(cwd, layOut),
    safeRel(cwd, routesOut),
    safeRel(cwd, pagesOut),
  );

  ctx.status.init = "done";
  return ctx;
}

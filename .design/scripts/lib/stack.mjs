\
import path from "node:path";
import { exists, readText } from "./fs.mjs";

export function detectStack(cwd) {
  const pkgPath = path.join(cwd, "package.json");
  if (!exists(pkgPath)) return { framework: "unknown", css: "unknown", ui: "unknown", notes: "package.json não encontrado" };
  const pkg = JSON.parse(readText(pkgPath));
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const has = (k) => Object.prototype.hasOwnProperty.call(deps, k);

  const framework =
    has("next") ? "Next.js" :
    has("react") ? "React" :
    has("vue") ? "Vue" :
    has("svelte") ? "Svelte" : "unknown";

  const css =
    has("tailwindcss") ? "Tailwind" :
    has("styled-components") ? "styled-components" :
    has("@emotion/react") ? "emotion" : "unknown";

  const ui =
    (has("class-variance-authority") || has("@radix-ui/react-slot")) ? "radix/cva-style" :
    has("@mui/material") ? "MUI" :
    has("antd") ? "AntD" : "custom/unknown";

  return { framework, css, ui, notes: "" };
}

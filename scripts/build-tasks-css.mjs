// Builds public/tasks/kaneo.css: the Kaneo (tasks) stylesheet, compiled with Tailwind v4 and then
// SCOPED to `.kaneo-root` so it can live next to the host app (Tailwind v3) without either side
// breaking the other.
//
// Why scoping is needed
//  1. Kaneo declares its design tokens on `:root` (`--border`, `--background`, ...). The host uses
//     the same names as HSL triplets (`hsl(var(--border) / .4)`), so while Kaneo's sheet was loaded
//     every host border/background resolved to an invalid colour and fell back to `currentcolor`,
//     which is where the bright white lines around the header, sidebar and inputs came from.
//  2. Tailwind v4 puts everything in native `@layer`s, and unlayered CSS always beats layered CSS,
//     so the host's v3 utilities (`.border-border`, `.bg-background`, ...) overrode Kaneo's own
//     utilities of the same name inside Kaneo's UI.
//
// What this does: flattens the layers (in layer order), then prefixes every selector with
// `.kaneo-root`. Utilities get the plain class (specificity 0,1,0 higher than the host's utilities),
// everything else gets `:where(.kaneo-root)` so the internal base < components < utilities order is
// unchanged. Rules aimed at `:root`/`html`/`body` are retargeted to `.kaneo-root` itself, and
// `.dark` (set on <html>) becomes `.dark .kaneo-root`.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const postcss = require("postcss");
const { transform } = require("lightningcss");

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INPUT = join(
  ROOT_DIR,
  "src/app/v2/(version-2)/(home)/tasks/_styles/index.css",
);
const OUTPUT = join(ROOT_DIR, "public/tasks/kaneo.css");
const HOST_TOKENS = join(
  ROOT_DIR,
  "src/app/v2/(version-2)/(home)/tasks/_styles/host-tokens.css",
);
const SCOPE = ".kaneo-root";
const LAYER_ORDER = ["properties", "theme", "base", "components", "utilities"];
const SELF_SELECTORS = new Set([":root", ":host", "html", "body"]);

function compileTailwind() {
  const dir = mkdtempSync(join(tmpdir(), "kaneo-css-"));
  const out = join(dir, "raw.css");
  try {
    execFileSync(
      process.execPath,
      [
        join(ROOT_DIR, "node_modules/@tailwindcss/cli/dist/index.mjs"),
        "-i",
        INPUT,
        "-o",
        out,
      ],
      { stdio: ["ignore", "ignore", "inherit"], cwd: ROOT_DIR },
    );
    return readFileSync(out, "utf8");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function scopeSelector(selector, layer) {
  const sel = selector.trim();
  if (sel.includes("::backdrop")) return []; // native <dialog> backdrops are not used
  if (SELF_SELECTORS.has(sel)) return [SCOPE];
  if (sel === ".dark") return [`.dark ${SCOPE}`, `${SCOPE}.dark`];
  // `:root[attr] .x` -> `.kaneo-root[attr] .x`: state set on the root element itself.
  if (/^:root[\[.:]/.test(sel)) return [`${SCOPE}${sel.slice(":root".length)}`];
  const prefix =
    layer === "utilities" || layer === null ? SCOPE : `:where(${SCOPE})`;
  if (sel.startsWith(".dark ")) {
    return [`.dark ${prefix} ${sel.slice(".dark ".length)}`];
  }
  return [`${prefix} ${sel}`];
}

function isInsideKeyframes(node) {
  for (let p = node.parent; p; p = p.parent) {
    if (p.type === "atrule" && /keyframes$/i.test(p.name)) return true;
  }
  return false;
}

function scopeRules(container, layer) {
  container.walkRules((rule) => {
    // Only top-level rules (optionally inside @media/@supports). Nested rules are relative to
    // their parent rule and must stay untouched.
    if (rule.parent?.type === "rule" || isInsideKeyframes(rule)) return;
    const scoped = [
      ...new Set(rule.selectors.flatMap((s) => scopeSelector(s, layer))),
    ];
    if (scoped.length === 0) rule.remove();
    else rule.selectors = scoped;
  });
}

function flattenAndScope(css) {
  const root = postcss.parse(css);
  const buckets = new Map(LAYER_ORDER.map((name) => [name, []]));
  const unlayered = [];
  const properties = [];

  for (const node of [...root.nodes]) {
    if (node.type === "comment") continue;
    if (node.type === "atrule" && node.name === "layer") {
      if (!node.nodes) continue; // `@layer a, b;` ordering statement
      const name = node.params.trim();
      const bucket = buckets.get(name) ?? unlayered;
      const wrapper = postcss.root();
      wrapper.append(node.nodes.map((n) => n.clone()));
      scopeRules(wrapper, name);
      bucket.push(...wrapper.nodes);
      continue;
    }
    if (node.type === "atrule" && /^(property|font-face)$/i.test(node.name)) {
      properties.push(node.clone());
      continue;
    }
    const wrapper = postcss.root();
    wrapper.append(node.clone());
    scopeRules(wrapper, null);
    unlayered.push(...wrapper.nodes);
  }

  const out = postcss.root();
  for (const name of LAYER_ORDER) out.append(buckets.get(name));
  out.append(unlayered, properties);
  return out.toString();
}

const raw = compileTailwind();
// The design-system bridge must stay on :root (it reads the host theme), so it is not scoped.
const scoped = `${flattenAndScope(raw)}\n${readFileSync(HOST_TOKENS, "utf8")}`;
const { code } = transform({
  filename: "kaneo.css",
  code: Buffer.from(scoped),
  minify: true,
});
writeFileSync(OUTPUT, code);
console.log(
  `kaneo.css: ${(raw.length / 1024).toFixed(0)}kB raw -> ${(code.length / 1024).toFixed(0)}kB scoped`,
);

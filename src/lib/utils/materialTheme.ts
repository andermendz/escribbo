import {
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
  type Theme as MCUTheme,
} from "@material/material-color-utilities";

export type ThemeMode = "light" | "dark";

export const DEFAULT_SEED_COLOR = "#6366f1";
const SEED_STORAGE_KEY = "ui_seed_color";

export function getStoredSeed(): string {
  if (typeof window === "undefined") return DEFAULT_SEED_COLOR;
  try {
    const raw = window.localStorage.getItem(SEED_STORAGE_KEY);
    if (raw && /^#[0-9a-fA-F]{6}$/.test(raw)) return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_SEED_COLOR;
}

export function setStoredSeed(hex: string) {
  try {
    window.localStorage.setItem(SEED_STORAGE_KEY, hex);
  } catch {
    /* ignore */
  }
}

type Scheme = ReturnType<MCUTheme["schemes"]["light"]["toJSON"]>;

// Translate an MCU scheme object into the Material 3 `--md-sys-color-*`
// custom-property names that the rest of the stylesheet references.
function schemeToVars(scheme: Scheme): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [key, value] of Object.entries(scheme)) {
    // MCU keys are camelCase (e.g. "onPrimaryContainer"); convert to kebab-case.
    const kebab = key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
    map[`--md-sys-color-${kebab}`] = hexFromArgb(value as number);
  }
  return map;
}

function writeVars(target: HTMLElement, vars: Record<string, string>) {
  for (const [k, v] of Object.entries(vars)) {
    target.style.setProperty(k, v);
  }
}

// Expose scheme vars on a dedicated `<style>` tag so they cascade naturally
// based on `:root` / `:root[data-theme=dark]` selectors.
function renderSchemeStylesheet(
  lightVars: Record<string, string>,
  darkVars: Record<string, string>,
) {
  const id = "md-sys-color-vars";
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }

  const renderBlock = (vars: Record<string, string>) =>
    Object.entries(vars)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join("\n");

  el.textContent = `
:root {
${renderBlock(lightVars)}
}
:root[data-theme="dark"] {
${renderBlock(darkVars)}
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${renderBlock(darkVars)}
  }
}
`;
}

export interface AppliedPalettes {
  light: Record<string, string>;
  dark: Record<string, string>;
}

// Generate M3 tonal palettes from `seedHex` and publish them as CSS custom
// properties for both light and dark schemes. Call this once at startup and
// again whenever the user picks a new seed color.
export function applyMaterialTheme(seedHex: string): AppliedPalettes {
  const seed = /^#[0-9a-fA-F]{6}$/.test(seedHex)
    ? seedHex
    : DEFAULT_SEED_COLOR;
  const theme = themeFromSourceColor(argbFromHex(seed));

  const lightVars = schemeToVars(theme.schemes.light.toJSON());
  const darkVars = schemeToVars(theme.schemes.dark.toJSON());

  renderSchemeStylesheet(lightVars, darkVars);

  // Also expose the seed itself so debug tooling / MUI can read it.
  writeVars(document.documentElement, {
    "--md-sys-color-seed": seed,
  });

  return { light: lightVars, dark: darkVars };
}

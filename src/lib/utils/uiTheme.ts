import type { UiTheme } from "@/bindings";

type Resolved = "light" | "dark";

let mqListener: ((e: MediaQueryListEvent) => void) | null = null;
let mq: MediaQueryList | null = null;

function resolveSystem(): Resolved {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function setRootTheme(resolved: Resolved) {
  const root = document.documentElement;
  root.setAttribute("data-theme", resolved);
}

export function applyUiTheme(theme: UiTheme) {
  if (typeof document === "undefined") return;

  if (mq && mqListener) {
    mq.removeEventListener("change", mqListener);
    mqListener = null;
    mq = null;
  }

  if (theme === "system") {
    const apply = () => setRootTheme(resolveSystem());
    apply();
    mq = window.matchMedia("(prefers-color-scheme: dark)");
    mqListener = () => apply();
    mq.addEventListener("change", mqListener);
  } else {
    setRootTheme(theme);
  }
}

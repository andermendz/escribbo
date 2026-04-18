import React, { useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useSeedColorStore } from "@/stores/seedColorStore";
import { useSettingsStore } from "@/stores/settingsStore";
import type { UiTheme } from "@/bindings";
import {
  applyMaterialTheme,
  type AppliedPalettes,
} from "@/lib/utils/materialTheme";

// Build an MUI theme that mirrors the Material 3 color roles we already emit
// as CSS vars. Only the subset MUI primitives (Switch, Slider, Dialog, …) are
// used so we don't need to map every token — just the ones MUI reads from
// `palette`.
function buildMuiTheme(
  mode: "light" | "dark",
  palettes: AppliedPalettes,
) {
  const p = mode === "dark" ? palettes.dark : palettes.light;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: p["--md-sys-color-primary"],
        contrastText: p["--md-sys-color-on-primary"],
      },
      secondary: {
        main: p["--md-sys-color-secondary"],
        contrastText: p["--md-sys-color-on-secondary"],
      },
      error: {
        main: p["--md-sys-color-error"],
        contrastText: p["--md-sys-color-on-error"],
      },
      background: {
        default: p["--md-sys-color-background"],
        paper: p["--md-sys-color-surface"],
      },
      text: {
        primary: p["--md-sys-color-on-surface"],
        secondary: p["--md-sys-color-on-surface-variant"],
      },
      divider: p["--md-sys-color-outline-variant"],
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: 14,
    },
    components: {
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 52,
            height: 32,
            padding: 0,
            display: "inline-flex",
            alignItems: "center",
          },
          switchBase: {
            padding: 6,
            "&.Mui-checked": {
              transform: "translateX(20px)",
              color: p["--md-sys-color-on-primary"],
              "& + .MuiSwitch-track": {
                backgroundColor: p["--md-sys-color-primary"],
                opacity: 1,
              },
              "& .MuiSwitch-thumb": {
                backgroundColor: p["--md-sys-color-on-primary"],
              },
            },
          },
          thumb: {
            width: 20,
            height: 20,
            boxShadow: "none",
            backgroundColor: p["--md-sys-color-outline"],
          },
          track: {
            borderRadius: 999,
            backgroundColor: p["--md-sys-color-surface-variant"],
            border: `2px solid ${p["--md-sys-color-outline"]}`,
            opacity: 1,
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          root: { color: p["--md-sys-color-primary"], height: 4 },
          rail: {
            color: p["--md-sys-color-surface-variant"],
            opacity: 1,
          },
          track: { border: "none" },
          thumb: {
            width: 20,
            height: 20,
            "&:hover, &.Mui-focusVisible": {
              boxShadow: `0 0 0 8px ${p["--md-sys-color-primary"]}1f`,
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 28,
            backgroundColor: p["--md-sys-color-surface"],
            color: p["--md-sys-color-on-surface"],
          },
        },
      },
    },
  });
}

function resolveMode(theme: UiTheme | undefined): "light" | "dark" {
  if (theme === "dark") return "dark";
  if (theme === "light") return "light";
  if (typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export const MaterialProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const seed = useSeedColorStore((s) => s.seed);
  const uiTheme = useSettingsStore(
    (s) => s.settings?.ui_theme as UiTheme | undefined,
  );

  const theme = useMemo(() => {
    // Re-compute whenever seed changes; also reapplies CSS vars in case the
    // stylesheet was dropped (HMR, etc.).
    const palettes = applyMaterialTheme(seed);
    return buildMuiTheme(resolveMode(uiTheme), palettes);
  }, [seed, uiTheme]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

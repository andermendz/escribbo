import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useSeedColorStore } from "@/stores/seedColorStore";
import { applyUiTheme } from "@/lib/utils/uiTheme";
import { applyMaterialTheme } from "@/lib/utils/materialTheme";
import type { UiTheme } from "@/bindings";

export function useUiTheme() {
  const theme = useSettingsStore(
    (state) => state.settings?.ui_theme as UiTheme | undefined,
  );
  const seed = useSeedColorStore((s) => s.seed);

  useEffect(() => {
    applyMaterialTheme(seed);
  }, [seed]);

  useEffect(() => {
    applyUiTheme(theme ?? "system");
  }, [theme]);
}

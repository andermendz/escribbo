import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { applyUiTheme } from "@/lib/utils/uiTheme";
import type { UiTheme } from "@/bindings";

export function useUiTheme() {
  const theme = useSettingsStore(
    (state) => state.settings?.ui_theme as UiTheme | undefined,
  );

  useEffect(() => {
    applyUiTheme(theme ?? "system");
  }, [theme]);
}

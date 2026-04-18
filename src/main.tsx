import React from "react";
import ReactDOM from "react-dom/client";
import { platform } from "@tauri-apps/plugin-os";
import App from "./App";
import {
  applyMaterialTheme,
  getStoredSeed,
} from "@/lib/utils/materialTheme";
import { MaterialProvider } from "@/providers/MaterialProvider";

// Set platform before render so CSS can scope per-platform (e.g. scrollbar styles)
document.documentElement.dataset.platform = platform();

// Apply Material 3 palettes before first paint so components never render with
// un-initialized `--md-sys-color-*` custom properties.
applyMaterialTheme(getStoredSeed());

// Initialize i18n
import "./i18n";

// Initialize model store (loads models and sets up event listeners)
import { useModelStore } from "./stores/modelStore";
useModelStore.getState().initialize();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MaterialProvider>
      <App />
    </MaterialProvider>
  </React.StrictMode>,
);

import React from "react";
import ReactDOM from "react-dom/client";
import RecordingOverlay from "./RecordingOverlay";
import "@/i18n";
import {
  applyMaterialTheme,
  getStoredSeed,
} from "@/lib/utils/materialTheme";

applyMaterialTheme(getStoredSeed());

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RecordingOverlay />
  </React.StrictMode>,
);

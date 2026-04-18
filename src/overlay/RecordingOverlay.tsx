import { listen } from "@tauri-apps/api/event";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MicrophoneIcon,
  TranscriptionIcon,
  CancelIcon,
} from "../components/icons";
import "./RecordingOverlay.css";
import { commands } from "@/bindings";
import i18n, { syncLanguageFromSettings } from "@/i18n";
import { getLanguageDirection } from "@/lib/utils/rtl";
import { applyMaterialTheme, getStoredSeed } from "@/lib/utils/materialTheme";

type OverlayState = "recording" | "transcribing" | "processing";
type Resolved = "light" | "dark";

const resolveSystemTheme = (): Resolved =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const RecordingOverlay: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [state, setState] = useState<OverlayState>("recording");
  const [levels, setLevels] = useState<number[]>(Array(16).fill(0));
  const [resolvedTheme, setResolvedTheme] = useState<Resolved>("dark");
  const [iconColor, setIconColor] = useState<string>("#A5B4FC");
  const smoothedLevelsRef = useRef<number[]>(Array(16).fill(0));
  const direction = getLanguageDirection(i18n.language);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  // Recompute the icon color from the current M3 palette whenever the theme
  // mode flips or the seed color changes. We read the CSS variable rather
  // than hardcoding hexes so it stays in sync with the user's seed.
  useEffect(() => {
    const readAccent = () => {
      const cs = getComputedStyle(document.documentElement);
      const hex = cs.getPropertyValue("--md-sys-color-primary").trim();
      if (hex) setIconColor(hex);
    };

    readAccent();

    // The main window writes to localStorage when the user picks a new seed;
    // `storage` events fire in *other* same-origin windows, which is exactly
    // what we need here to refresh the overlay's palette.
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ui_seed_color") {
        applyMaterialTheme(getStoredSeed());
        readAccent();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [resolvedTheme]);

  useEffect(() => {
    let mq: MediaQueryList | null = null;
    let mqHandler: ((e: MediaQueryListEvent) => void) | null = null;

    const syncThemeFromSettings = async () => {
      try {
        const res = await commands.getAppSettings();
        const pref = res.status === "ok" ? res.data.ui_theme : "system";
        if (mq && mqHandler) {
          mq.removeEventListener("change", mqHandler);
          mq = null;
          mqHandler = null;
        }
        if (pref === "system") {
          setResolvedTheme(resolveSystemTheme());
          mq = window.matchMedia("(prefers-color-scheme: dark)");
          mqHandler = () => setResolvedTheme(resolveSystemTheme());
          mq.addEventListener("change", mqHandler);
        } else {
          setResolvedTheme(pref as Resolved);
        }
      } catch (e) {
        console.warn("Failed to sync overlay theme:", e);
      }
    };

    syncThemeFromSettings();
    const unlistenThemePromise = listen("settings-changed", (ev) => {
      const payload = ev.payload as { setting?: string } | undefined;
      if (!payload?.setting || payload.setting === "ui_theme") {
        syncThemeFromSettings();
      }
    });

    return () => {
      if (mq && mqHandler) mq.removeEventListener("change", mqHandler);
      unlistenThemePromise.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    const applyScale = (scale: number) => {
      const clamped = Math.min(2, Math.max(0.5, scale));
      (document.documentElement.style as unknown as { zoom: string }).zoom =
        String(clamped);
    };

    commands
      .getAppSettings()
      .then((res) => {
        if (res.status === "ok") {
          applyScale(res.data.overlay_scale ?? 1);
        }
      })
      .catch(() => {});

    const unlistenPromise = listen<number>("overlay-scale", (ev) => {
      applyScale(Number(ev.payload) || 1);
    });

    return () => {
      unlistenPromise.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    const setupEventListeners = async () => {
      // Listen for show-overlay event from Rust
      const unlistenShow = await listen("show-overlay", async (event) => {
        // Sync language from settings each time overlay is shown
        await syncLanguageFromSettings();
        const overlayState = event.payload as OverlayState;
        setState(overlayState);
        setIsVisible(true);
      });

      // Listen for hide-overlay event from Rust
      const unlistenHide = await listen("hide-overlay", () => {
        setIsVisible(false);
      });

      // Listen for mic-level updates
      const unlistenLevel = await listen<number[]>("mic-level", (event) => {
        const newLevels = event.payload as number[];

        // Apply smoothing to reduce jitter
        const smoothed = smoothedLevelsRef.current.map((prev, i) => {
          const target = newLevels[i] || 0;
          return prev * 0.7 + target * 0.3; // Smooth transition
        });

        smoothedLevelsRef.current = smoothed;
        setLevels(smoothed.slice(0, 9));
      });

      // Cleanup function
      return () => {
        unlistenShow();
        unlistenHide();
        unlistenLevel();
      };
    };

    setupEventListeners();
  }, []);

  const getIcon = () => {
    if (state === "recording") {
      return <MicrophoneIcon color={iconColor} />;
    } else {
      return <TranscriptionIcon color={iconColor} />;
    }
  };

  return (
    <div
      dir={direction}
      className={`recording-overlay ${isVisible ? "fade-in" : ""}`}
    >
      <div className="overlay-left">{getIcon()}</div>

      <div className="overlay-middle">
        {state === "recording" && (
          <div className="bars-container">
            {levels.map((v, i) => (
              <div
                key={i}
                className="bar"
                style={{
                  height: `${Math.min(20, 4 + Math.pow(v, 0.7) * 16)}px`, // Cap at 20px max height
                  transition: "height 60ms ease-out, opacity 120ms ease-out",
                  opacity: Math.max(0.2, v * 1.7), // Minimum opacity for visibility
                }}
              />
            ))}
          </div>
        )}
        {state === "transcribing" && (
          <div className="transcribing-text">{t("overlay.transcribing")}</div>
        )}
        {state === "processing" && (
          <div className="transcribing-text">{t("overlay.processing")}</div>
        )}
      </div>

      <div className="overlay-right">
        {state === "recording" && (
          <div
            className="cancel-button"
            onClick={() => {
              commands.cancelOperation();
            }}
          >
            <CancelIcon color={iconColor} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordingOverlay;

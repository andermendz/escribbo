import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Check, Palette, RotateCcw } from "lucide-react";
import { SettingContainer } from "../../ui/SettingContainer";
import { useSeedColorStore } from "@/stores/seedColorStore";
import { DEFAULT_SEED_COLOR } from "@/lib/utils/materialTheme";

interface SeedColorPickerProps {
  descriptionMode?: "tooltip" | "inline";
  grouped?: boolean;
}

const PRESETS: { hex: string; labelKey: string }[] = [
  { hex: "#6366f1", labelKey: "settings.general.seedColor.presets.indigo" },
  { hex: "#0ea5e9", labelKey: "settings.general.seedColor.presets.sky" },
  { hex: "#10b981", labelKey: "settings.general.seedColor.presets.emerald" },
  { hex: "#f59e0b", labelKey: "settings.general.seedColor.presets.amber" },
  { hex: "#ef4444", labelKey: "settings.general.seedColor.presets.red" },
  { hex: "#ec4899", labelKey: "settings.general.seedColor.presets.pink" },
  { hex: "#8b5cf6", labelKey: "settings.general.seedColor.presets.violet" },
  { hex: "#64748b", labelKey: "settings.general.seedColor.presets.slate" },
];

// Pick black or white ink depending on swatch luminance for legible check marks.
const getContrastInk = (hex: string): string => {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#fff";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#000" : "#fff";
};

export const SeedColorPicker: React.FC<SeedColorPickerProps> = ({
  descriptionMode = "tooltip",
  grouped = true,
}) => {
  const { t } = useTranslation();
  const { seed, setSeed, previewSeed, commitSeed, reset } =
    useSeedColorStore();
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Coalesce the continuous stream of `input` events the native color picker
  // fires while the user drags into at most one palette recompute per frame.
  const rafRef = useRef<number | null>(null);
  const pendingHexRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const schedulePreview = (hex: string) => {
    pendingHexRef.current = hex;
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const next = pendingHexRef.current;
      pendingHexRef.current = null;
      if (next) previewSeed(next);
    });
  };

  const handleColorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    schedulePreview(e.target.value);
  };

  const handleColorCommit = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (pendingHexRef.current) {
      previewSeed(pendingHexRef.current);
      pendingHexRef.current = null;
    }
    commitSeed();
  };

  const isCustom = !PRESETS.some(
    (p) => p.hex.toLowerCase() === seed.toLowerCase(),
  );
  const isDefault = seed.toLowerCase() === DEFAULT_SEED_COLOR.toLowerCase();

  const openCustomPicker = () => colorInputRef.current?.click();

  return (
    <SettingContainer
      title={t("settings.general.seedColor.title")}
      description={t("settings.general.seedColor.description")}
      descriptionMode={descriptionMode}
      grouped={grouped}
      layout="stacked"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          {PRESETS.map((p) => {
            const active = p.hex.toLowerCase() === seed.toLowerCase();
            const ink = getContrastInk(p.hex);
            return (
              <button
                key={p.hex}
                type="button"
                title={t(p.labelKey)}
                aria-label={t(p.labelKey)}
                aria-pressed={active}
                onClick={() => setSeed(p.hex)}
                className={`relative w-10 h-10 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface hover:scale-110 ${
                  active
                    ? "shadow-e2 scale-105"
                    : "hover:shadow-e1"
                }`}
                style={{ backgroundColor: p.hex }}
              >
                {active && (
                  <Check
                    className="absolute inset-0 m-auto w-5 h-5"
                    style={{ color: ink }}
                    strokeWidth={3}
                  />
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={openCustomPicker}
            title={t("settings.general.seedColor.pickerLabel")}
            aria-label={t("settings.general.seedColor.pickerLabel")}
            aria-pressed={isCustom}
            className={`relative w-10 h-10 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface hover:scale-110 overflow-hidden ${
              isCustom ? "shadow-e2 scale-105" : "hover:shadow-e1"
            }`}
            style={{
              background: isCustom
                ? seed
                : "conic-gradient(from 0deg, #ef4444, #f59e0b, #10b981, #0ea5e9, #6366f1, #ec4899, #ef4444)",
            }}
          >
            {isCustom ? (
              <Check
                className="absolute inset-0 m-auto w-5 h-5"
                style={{ color: getContrastInk(seed) }}
                strokeWidth={3}
              />
            ) : (
              <Palette
                className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow"
                strokeWidth={2.5}
              />
            )}
            <input
              ref={colorInputRef}
              type="color"
              value={seed}
              onInput={handleColorInput}
              onChange={handleColorCommit}
              onBlur={handleColorCommit}
              className="absolute inset-0 opacity-0 cursor-pointer"
              tabIndex={-1}
              aria-hidden
            />
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-2 px-3 h-7 rounded-full bg-surface-variant/60 text-on-surface-variant font-mono">
            <span
              className="w-3 h-3 rounded-full ring-1 ring-inset ring-outline-variant"
              style={{ backgroundColor: seed }}
            />
            {seed.toUpperCase()}
          </span>
          {!isDefault && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 h-7 px-3 rounded-full text-primary hover:bg-primary/8 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t("common.reset")}
            </button>
          )}
        </div>
      </div>
    </SettingContainer>
  );
};

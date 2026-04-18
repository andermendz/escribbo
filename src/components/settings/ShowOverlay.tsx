import React from "react";
import { useTranslation } from "react-i18next";
import { Dropdown } from "../ui/Dropdown";
import { SettingContainer } from "../ui/SettingContainer";
import { Slider } from "../ui/Slider";
import { useSettings } from "../../hooks/useSettings";
import type { OverlayPosition } from "@/bindings";

interface ShowOverlayProps {
  descriptionMode?: "inline" | "tooltip";
  grouped?: boolean;
}

export const ShowOverlay: React.FC<ShowOverlayProps> = React.memo(
  ({ descriptionMode = "tooltip", grouped = false }) => {
    const { t } = useTranslation();
    const { getSetting, updateSetting, isUpdating } = useSettings();

    const overlayOptions = [
      { value: "none", label: t("settings.advanced.overlay.options.none") },
      { value: "bottom", label: t("settings.advanced.overlay.options.bottom") },
      { value: "top", label: t("settings.advanced.overlay.options.top") },
    ];

    const selectedPosition = (getSetting("overlay_position") ||
      "bottom") as OverlayPosition;
    const overlayOffset = (getSetting("overlay_offset") ?? 0) as number;
    const offsetVisible = selectedPosition !== "none";

    return (
      <>
        <SettingContainer
          title={t("settings.advanced.overlay.title")}
          description={t("settings.advanced.overlay.description")}
          descriptionMode={descriptionMode}
          grouped={grouped}
        >
          <Dropdown
            options={overlayOptions}
            selectedValue={selectedPosition}
            onSelect={(value) =>
              updateSetting("overlay_position", value as OverlayPosition)
            }
            disabled={isUpdating("overlay_position")}
          />
        </SettingContainer>
        {offsetVisible && (
          <Slider
            label={t("settings.advanced.overlay.offset.title")}
            description={t("settings.advanced.overlay.offset.description")}
            descriptionMode={descriptionMode}
            grouped={grouped}
            min={-200}
            max={200}
            step={1}
            value={overlayOffset}
            onChange={(value) =>
              updateSetting("overlay_offset", Math.round(value))
            }
            disabled={isUpdating("overlay_offset")}
            formatValue={(v) => `${Math.round(v)} px`}
          />
        )}
      </>
    );
  },
);

import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown } from "../ui/Dropdown";
import { SettingContainer } from "../ui/SettingContainer";
import { Slider } from "../ui/Slider";
import { useSettings } from "../../hooks/useSettings";
import { commands, type OverlayPosition } from "@/bindings";

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
      {
        value: "bottom_left",
        label: t("settings.advanced.overlay.options.bottom_left"),
      },
      {
        value: "bottom_right",
        label: t("settings.advanced.overlay.options.bottom_right"),
      },
      { value: "top", label: t("settings.advanced.overlay.options.top") },
      {
        value: "top_left",
        label: t("settings.advanced.overlay.options.top_left"),
      },
      {
        value: "top_right",
        label: t("settings.advanced.overlay.options.top_right"),
      },
    ];

    const selectedPosition = (getSetting("overlay_position") ||
      "bottom") as OverlayPosition;
    const overlayOffset = (getSetting("overlay_offset") ?? 0) as number;
    const overlayOffsetX = (getSetting("overlay_offset_x") ?? 0) as number;
    const overlayScale = (getSetting("overlay_scale") ?? 1) as number;
    const offsetVisible = selectedPosition !== "none";
    const scaleVisible = selectedPosition !== "none";

    // Local drafts so native range inputs stay smooth and aren't disabled
    // mid-drag by in-flight Tauri updates.
    const [draftOffset, setDraftOffset] = useState(overlayOffset);
    const [draftOffsetX, setDraftOffsetX] = useState(overlayOffsetX);
    const [draftScale, setDraftScale] = useState(overlayScale);
    const isDraggingOffsetRef = useRef(false);
    const isDraggingOffsetXRef = useRef(false);
    const isDraggingScaleRef = useRef(false);

    useEffect(() => {
      if (!isDraggingOffsetRef.current) setDraftOffset(overlayOffset);
    }, [overlayOffset]);

    useEffect(() => {
      if (!isDraggingOffsetXRef.current) setDraftOffsetX(overlayOffsetX);
    }, [overlayOffsetX]);

    useEffect(() => {
      if (!isDraggingScaleRef.current) setDraftScale(overlayScale);
    }, [overlayScale]);

    const handleOffsetChange = (value: number) => {
      isDraggingOffsetRef.current = true;
      const rounded = Math.round(value);
      setDraftOffset(rounded);
      void commands.previewOverlayOffset(rounded);
    };

    const handleOffsetCommit = (value: number) => {
      isDraggingOffsetRef.current = false;
      updateSetting("overlay_offset", Math.round(value));
    };

    const handleOffsetReset = () => {
      isDraggingOffsetRef.current = false;
      setDraftOffset(0);
      void commands.previewOverlayOffset(0);
      updateSetting("overlay_offset", 0);
    };

    const handleOffsetXChange = (value: number) => {
      isDraggingOffsetXRef.current = true;
      const rounded = Math.round(value);
      setDraftOffsetX(rounded);
      void commands.previewOverlayOffsetX(rounded);
    };

    const handleOffsetXCommit = (value: number) => {
      isDraggingOffsetXRef.current = false;
      updateSetting("overlay_offset_x", Math.round(value));
    };

    const handleOffsetXReset = () => {
      isDraggingOffsetXRef.current = false;
      setDraftOffsetX(0);
      void commands.previewOverlayOffsetX(0);
      updateSetting("overlay_offset_x", 0);
    };

    const handleScaleChange = (value: number) => {
      isDraggingScaleRef.current = true;
      const rounded = Math.round(value * 100) / 100;
      setDraftScale(rounded);
      void commands.previewOverlayScale(rounded);
    };

    const handleScaleCommit = (value: number) => {
      isDraggingScaleRef.current = false;
      const rounded = Math.round(value * 100) / 100;
      updateSetting("overlay_scale", rounded);
    };

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
            value={draftOffset}
            onChange={handleOffsetChange}
            onCommit={handleOffsetCommit}
            onReset={handleOffsetReset}
            resetValue={0}
            resetLabel={t("common.reset")}
            formatValue={(v) => `${Math.round(v)} px`}
          />
        )}
        {offsetVisible && (
          <Slider
            label={t("settings.advanced.overlay.offsetX.title")}
            description={t("settings.advanced.overlay.offsetX.description")}
            descriptionMode={descriptionMode}
            grouped={grouped}
            min={-400}
            max={400}
            step={1}
            value={draftOffsetX}
            onChange={handleOffsetXChange}
            onCommit={handleOffsetXCommit}
            onReset={handleOffsetXReset}
            resetValue={0}
            resetLabel={t("common.reset")}
            formatValue={(v) => `${Math.round(v)} px`}
          />
        )}
        {scaleVisible && (
          <Slider
            label={t("settings.advanced.overlay.scale.title")}
            description={t("settings.advanced.overlay.scale.description")}
            descriptionMode={descriptionMode}
            grouped={grouped}
            min={0.5}
            max={2}
            step={0.05}
            value={draftScale}
            onChange={handleScaleChange}
            onCommit={handleScaleCommit}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />
        )}
      </>
    );
  },
);

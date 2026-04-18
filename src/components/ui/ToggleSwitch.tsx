import React from "react";
import MuiSwitch from "@mui/material/Switch";
import CircularProgress from "@mui/material/CircularProgress";
import { SettingContainer } from "./SettingContainer";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  isUpdating?: boolean;
  label: string;
  description: string;
  descriptionMode?: "inline" | "tooltip";
  grouped?: boolean;
  tooltipPosition?: "top" | "bottom";
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  isUpdating = false,
  label,
  description,
  descriptionMode = "tooltip",
  grouped = false,
  tooltipPosition = "top",
}) => {
  return (
    <SettingContainer
      title={label}
      description={description}
      descriptionMode={descriptionMode}
      grouped={grouped}
      disabled={disabled}
      tooltipPosition={tooltipPosition}
    >
      <div className="relative inline-flex items-center">
        <MuiSwitch
          checked={checked}
          disabled={disabled || isUpdating}
          onChange={(_, value) => onChange(value)}
          slotProps={{ input: { "aria-label": label } }}
        />
        {isUpdating && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <CircularProgress size={16} />
          </div>
        )}
      </div>
    </SettingContainer>
  );
};

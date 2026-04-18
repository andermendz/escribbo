import React from "react";
import MuiSlider from "@mui/material/Slider";
import { SettingContainer } from "./SettingContainer";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  onCommit?: (value: number) => void;
  onReset?: () => void;
  resetValue?: number;
  resetLabel?: string;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  label: string;
  description: string;
  descriptionMode?: "inline" | "tooltip";
  grouped?: boolean;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  onCommit,
  onReset,
  resetValue,
  resetLabel = "Reset",
  min,
  max,
  step = 0.01,
  disabled = false,
  label,
  description,
  descriptionMode = "tooltip",
  grouped = false,
  showValue = true,
  formatValue = (v) => v.toFixed(2),
}) => {
  return (
    <SettingContainer
      title={label}
      description={description}
      descriptionMode={descriptionMode}
      grouped={grouped}
      layout="horizontal"
      disabled={disabled}
    >
      <div className="w-full min-w-[180px]">
        <div className="flex items-center space-x-3 h-8">
          <MuiSlider
            value={value}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            onChange={(_, v) => onChange(v as number)}
            onChangeCommitted={(_, v) => onCommit?.(v as number)}
            aria-label={label}
            sx={{ flexGrow: 1 }}
          />
          {showValue && (
            <span className="text-sm font-medium text-on-surface/90 w-12 text-end tabular-nums">
              {formatValue(value)}
            </span>
          )}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              disabled={
                disabled ||
                (resetValue !== undefined && value === resetValue)
              }
              title={resetLabel}
              aria-label={resetLabel}
              className="flex items-center justify-center w-8 h-8 rounded-full text-on-surface-variant hover:bg-primary/8 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <path d="M3 4v5h5" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </SettingContainer>
  );
};

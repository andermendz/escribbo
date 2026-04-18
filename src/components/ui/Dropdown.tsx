import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  className?: string;
  selectedValue: string | null;
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onRefresh?: () => void;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  onSelect,
  className = "",
  placeholder = "Select an option...",
  disabled = false,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(
    (option) => option.value === selectedValue,
  );

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && onRefresh) onRefresh();
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className={`h-9 px-3 text-sm font-medium bg-surface border border-outline rounded-lg min-w-[200px] text-start flex items-center justify-between transition-colors ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-primary/8 cursor-pointer hover:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus:outline-none"
        }`}
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate text-on-surface">
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className={`w-4 h-4 ms-2 shrink-0 text-on-surface-variant transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && !disabled && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-surface border border-outline-variant rounded-lg shadow-e2 z-50 max-h-60 overflow-y-auto py-1"
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-on-surface-variant">
              {t("common.noOptionsFound")}
            </div>
          ) : (
            options.map((option) => {
              const active = selectedValue === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`w-full px-3 py-2 text-sm text-start hover:bg-primary/8 transition-colors ${
                    active
                      ? "bg-secondary-container text-on-secondary-container font-medium"
                      : "text-on-surface"
                  } ${option.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => handleSelect(option.value)}
                  disabled={option.disabled}
                >
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

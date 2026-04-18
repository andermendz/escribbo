import React from "react";
import { useTranslation } from "react-i18next";
import { Cog, FlaskConical, History, Home, Info, Sparkles, Cpu } from "lucide-react";
import { useSettings } from "../hooks/useSettings";
import {
  GeneralSettings,
  AdvancedSettings,
  HistorySettings,
  DebugSettings,
  AboutSettings,
  PostProcessingSettings,
  ModelsSettings,
} from "./settings";

export type SidebarSection = keyof typeof SECTIONS_CONFIG;

interface IconProps {
  width?: number | string;
  height?: number | string;
  size?: number | string;
  className?: string;
  [key: string]: any;
}

interface SectionConfig {
  labelKey: string;
  icon: React.ComponentType<IconProps>;
  component: React.ComponentType;
  enabled: (settings: any) => boolean;
}

export const SECTIONS_CONFIG = {
  general: {
    labelKey: "sidebar.general",
    icon: Home,
    component: GeneralSettings,
    enabled: () => true,
  },
  models: {
    labelKey: "sidebar.models",
    icon: Cpu,
    component: ModelsSettings,
    enabled: () => true,
  },
  advanced: {
    labelKey: "sidebar.advanced",
    icon: Cog,
    component: AdvancedSettings,
    enabled: () => true,
  },
  history: {
    labelKey: "sidebar.history",
    icon: History,
    component: HistorySettings,
    enabled: () => true,
  },
  postprocessing: {
    labelKey: "sidebar.postProcessing",
    icon: Sparkles,
    component: PostProcessingSettings,
    enabled: (settings) => settings?.post_process_enabled ?? false,
  },
  debug: {
    labelKey: "sidebar.debug",
    icon: FlaskConical,
    component: DebugSettings,
    enabled: (settings) => settings?.debug_mode ?? false,
  },
  about: {
    labelKey: "sidebar.about",
    icon: Info,
    component: AboutSettings,
    enabled: () => true,
  },
} as const satisfies Record<string, SectionConfig>;

interface SidebarProps {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const { t } = useTranslation();
  const { settings } = useSettings();

  const availableSections = Object.entries(SECTIONS_CONFIG)
    .filter(([_, config]) => config.enabled(settings))
    .map(([id, config]) => ({ id: id as SidebarSection, ...config }));

  return (
    <nav
      aria-label="Settings sections"
      className="flex flex-col w-20 h-full items-center gap-1 py-4 bg-surface border-e border-outline-variant"
    >
      {availableSections.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;
        const label = t(section.labelKey);

        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSectionChange(section.id)}
            title={label}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className="group flex flex-col items-center justify-center w-full gap-1 py-2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer focus:outline-none"
          >
            <span
              className={`flex items-center justify-center h-8 w-14 rounded-full transition-[background-color,color] ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container"
                  : "group-hover:bg-on-surface/8 group-focus-visible:bg-on-surface/12"
              }`}
            >
              <Icon width={22} height={22} className="shrink-0" />
            </span>
            <span
              className={`text-[11px] font-medium leading-tight truncate max-w-full px-1 ${
                isActive ? "text-on-surface" : ""
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

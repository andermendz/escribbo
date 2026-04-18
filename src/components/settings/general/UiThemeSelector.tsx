import React from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../../hooks/useSettings";
import type { UiTheme } from "@/bindings";
import { Dropdown } from "../../ui/Dropdown";
import { SettingContainer } from "../../ui/SettingContainer";

interface UiThemeSelectorProps {
  descriptionMode?: "tooltip" | "inline";
  grouped?: boolean;
}

export const UiThemeSelector: React.FC<UiThemeSelectorProps> = ({
  descriptionMode = "tooltip",
  grouped = true,
}) => {
  const { t } = useTranslation();
  const { getSetting, updateSetting } = useSettings();

  const options = [
    {
      value: "system" as UiTheme,
      label: t("settings.general.uiTheme.system"),
    },
    {
      value: "light" as UiTheme,
      label: t("settings.general.uiTheme.light"),
    },
    {
      value: "dark" as UiTheme,
      label: t("settings.general.uiTheme.dark"),
    },
  ];

  const current = (getSetting("ui_theme") as UiTheme | undefined) ?? "system";

  return (
    <SettingContainer
      title={t("settings.general.uiTheme.title")}
      description={t("settings.general.uiTheme.description")}
      descriptionMode={descriptionMode}
      grouped={grouped}
    >
      <Dropdown
        options={options}
        selectedValue={current}
        onSelect={(value) => updateSetting("ui_theme", value as UiTheme)}
        disabled={false}
      />
    </SettingContainer>
  );
};

import React from "react";

interface SettingsGroupProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingsGroup: React.FC<SettingsGroupProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="space-y-3">
      {title && (
        <div className="px-4">
          <h2 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-on-surface-variant mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="bg-surface-variant/40 rounded-2xl">
        <div className="divide-y divide-outline-variant [&>*:first-child]:rounded-t-2xl [&>*:last-child]:rounded-b-2xl">
          {children}
        </div>
      </div>
    </div>
  );
};

import React from "react";

// Canonical Material 3 button variants.
type M3Variant =
  | "filled"
  | "tonal"
  | "outlined"
  | "text"
  | "elevated"
  | "filled-danger";

// Legacy variant names preserved so existing call-sites keep working.
type LegacyVariant =
  | "primary"
  | "primary-soft"
  | "secondary"
  | "danger"
  | "danger-ghost"
  | "ghost";

export type ButtonVariant = M3Variant | LegacyVariant;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
}

const LEGACY_ALIASES: Record<LegacyVariant, M3Variant> = {
  primary: "filled",
  "primary-soft": "tonal",
  secondary: "outlined",
  danger: "filled-danger",
  "danger-ghost": "text",
  ghost: "text",
};

function resolveVariant(v: ButtonVariant): M3Variant {
  return (LEGACY_ALIASES as Record<string, M3Variant>)[v] ?? (v as M3Variant);
}

const VARIANT_CLASSES: Record<M3Variant, string> = {
  filled:
    "text-on-primary bg-primary border-transparent hover:shadow-e1 focus-visible:ring-2 focus-visible:ring-primary/40",
  tonal:
    "text-on-secondary-container bg-secondary-container border-transparent hover:shadow-e1 focus-visible:ring-2 focus-visible:ring-primary/40",
  outlined:
    "text-primary bg-transparent border-outline hover:bg-primary/8 focus-visible:ring-2 focus-visible:ring-primary/40",
  text:
    "text-primary bg-transparent border-transparent hover:bg-primary/8 focus-visible:ring-2 focus-visible:ring-primary/40",
  elevated:
    "text-primary bg-surface border-transparent shadow-e1 hover:shadow-e2 focus-visible:ring-2 focus-visible:ring-primary/40",
  "filled-danger":
    "text-on-error bg-error border-transparent hover:shadow-e1 focus-visible:ring-2 focus-visible:ring-error/40",
};

const SIZE_CLASSES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "filled",
  size = "md",
  ...props
}) => {
  const resolved = resolveVariant(variant);
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-full border " +
    "transition-[background-color,box-shadow,transform,color] duration-150 " +
    "focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed " +
    "cursor-pointer select-none state-layer";

  return (
    <button
      className={`${base} ${VARIANT_CLASSES[resolved]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

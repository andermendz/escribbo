import React from "react";

const EscribboTextLogo = ({
  width,
  height,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 600 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Escribbo"
      role="img"
    >
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontSize="120"
        fontWeight="700"
        letterSpacing="-4"
        className="logo-primary"
        stroke="currentColor"
        strokeWidth="0"
      >
        Escribbo
      </text>
    </svg>
  );
};

export default EscribboTextLogo;

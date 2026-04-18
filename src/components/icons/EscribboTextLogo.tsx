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
  const aspect = 600 / 160;
  const w = width ?? (height ? Math.round(height * aspect) : 200);
  const h = height ?? Math.round(w / aspect);
  return (
    <svg
      width={w}
      height={h}
      className={className}
      viewBox="0 0 600 160"
      fill="var(--escribbo-logo)"
      stroke="var(--escribbo-logo)"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Escribbo"
      role="img"
    >
      <g transform="translate(8, 32) scale(2)">
        {/* Ink Trail / Wave */}
        <path
          d="M16 24H9C6.23858 24 4 26.2386 4 29C4 31.7614 6.23858 34 9 34H39C41.7614 34 44 36.2386 44 39C44 41.7614 41.7614 44 39 44H18"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Pen Handle / Tip */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M24 24V19L39 4L44 9L29 24H24Z"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      {/* Product wordmark — brand name not translated */}
      {/* eslint-disable i18next/no-literal-string */}
      <text
        x={130}
        y={80}
        dominantBaseline="middle"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontSize={100}
        fontWeight={700}
        letterSpacing={-3}
        fill="var(--escribbo-logo)"
        stroke="none"
      >
        Escribbo
      </text>
      {/* eslint-enable i18next/no-literal-string */}
    </svg>
  );
};

export default EscribboTextLogo;

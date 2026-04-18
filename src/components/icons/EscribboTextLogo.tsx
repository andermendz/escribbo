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
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Escribbo"
      role="img"
    >
      <g transform="translate(8, 32) scale(2)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M24 24V19L39 4L44 9L29 24H24Z"
          fill="#2F88FF"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 24H9C6.23858 24 4 26.2386 4 29C4 31.7614 6.23858 34 9 34H39C41.7614 34 44 36.2386 44 39C44 41.7614 41.7614 44 39 44H18"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
      <text
        x={130}
        y={80}
        dominantBaseline="middle"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontSize={100}
        fontWeight={700}
        letterSpacing={-3}
        className="logo-primary"
        fill="currentColor"
      >
        Escribbo
      </text>
    </svg>
  );
};

export default EscribboTextLogo;

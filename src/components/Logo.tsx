/** FareSankhya mark. Colours are hardcoded on purpose: never recolour per theme. */
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="FareSankhya" className="flex-none">
      <circle cx="50" cy="50" r="46" fill="#0E1B26" />
      <path d="M14 70 L32 62 L44 66 L58 52 L70 42 L86 32" fill="none" stroke="#3B4C59" strokeWidth="3" />
      <g transform="translate(29,14) scale(0.5) rotate(42 50 50)">
        <path d="M50 3 C53.5 3 56 11 56.5 22 L56.5 40 L94 70 L94 78 L56.5 64 L56.5 82 L70 92 L70 96 L50 90 L30 96 L30 92 L43.5 82 L43.5 64 L6 78 L6 70 L43.5 40 L43.5 22 C44 11 46.5 3 50 3 Z" fill="#FFFFFF" />
      </g>
      <path d="M15.1 80 L84.9 80 L77.3 87 L22.7 87 Z" fill="#CF5C11" />
    </svg>
  );
}

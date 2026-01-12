// This file is no longer used for the welcome page, but is kept for potential future use.
export function SplashLogo() {
  return (
    <div className="w-80 h-auto text-foreground">
      <svg
        viewBox="0 0 200 100"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <text
          x="100"
          y="75"
          fontFamily="Lora, serif"
          fontSize="20"
          fontWeight="bold"
          textAnchor="middle"
          fill="currentColor"
        >
          NOVA'S
        </text>
        <line x1="25" y1="85" x2="80" y2="85" stroke="currentColor" strokeWidth="1" />
        <text
          x="100"
          y="92"
          fontFamily="Inter, sans-serif"
          fontSize="6"
          letterSpacing="2"
          textAnchor="middle"
          fill="currentColor"
        >
          BRAID GAME
        </text>
        <line x1="120" y1="85" x2="175" y2="85" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  );
}

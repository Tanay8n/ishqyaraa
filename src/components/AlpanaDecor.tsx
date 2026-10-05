import React from "react";

export function AlpanaMotif({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
      <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <circle cx="50" cy="50" r="26" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      {/* 8 Petal Lotus Alpana Pattern */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <g key={i} transform={`rotate(${angle} 50 50)`}>
          <path
            d="M50 14 C46 26, 44 34, 50 42 C56 34, 54 26, 50 14 Z"
            fill="currentColor"
            fillOpacity="0.15"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <circle cx="50" cy="18" r="2" fill="currentColor" fillOpacity="0.5" />
        </g>
      ))}
      <circle cx="50" cy="50" r="8" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="3" fill="currentColor" />
    </svg>
  );
}

export function KashPhoolIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22V7" strokeLinecap="round" />
      <path d="M12 7C10 5 8 6 7 9C6.5 10.5 7 13 12 14" strokeLinecap="round" />
      <path d="M12 10C14 8 16 9 17 12C17.5 13.5 17 16 12 17" strokeLinecap="round" />
      <path d="M12 4C11 2 9 3 9 5C9 6.5 10 7.5 12 8" strokeLinecap="round" />
      <path d="M12 5C13 3 15 4 15 6C15 7.5 14 8.5 12 9" strokeLinecap="round" />
    </svg>
  );
}

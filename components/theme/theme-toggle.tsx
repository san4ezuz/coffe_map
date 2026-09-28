"use client";

import { useTheme } from "./theme-provider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Переключить тему"
      className={`flex items-center justify-center rounded-full border cursor-pointer ${className}`}
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      {theme === "light" ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4.2" fill="var(--color-text)" />
          <g stroke="var(--color-text)" strokeWidth="1.6" strokeLinecap="round">
            <line x1="12" y1="2.5" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="21.5" />
            <line x1="2.5" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="21.5" y2="12" />
            <line x1="5.1" y1="5.1" x2="6.8" y2="6.8" />
            <line x1="17.2" y1="17.2" x2="18.9" y2="18.9" />
            <line x1="5.1" y1="18.9" x2="6.8" y2="17.2" />
            <line x1="17.2" y1="6.8" x2="18.9" y2="5.1" />
          </g>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 13.5A8.5 8.5 0 1 1 10.5 4a6.8 6.8 0 0 0 9.5 9.5Z"
            fill="var(--color-text)"
          />
        </svg>
      )}
    </button>
  );
}

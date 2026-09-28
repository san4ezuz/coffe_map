function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "var(--color-primary)" : "none"}>
      <path
        d="M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.3 4.5 5.7 4c2-.3 3.9.6 5 2.2C11.8 4.6 13.7 3.7 15.7 4c3.4.5 5.2 3.8 3.7 7.2-2.5 4.7-10 9.3-10 9.3-1.4-.9-1.4-.9-1.4-.9Z"
        stroke={filled ? "var(--color-primary)" : "var(--color-text)"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FavoriteButton({
  active,
  onClick,
  size = 36,
  className = "",
  label,
}: {
  active: boolean;
  onClick: () => void;
  size?: number;
  className?: string;
  /** Override the default "add/remove favorite" label — e.g. for a favorites-only filter toggle. */
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label ?? (active ? "Убрать из избранного" : "Добавить в избранное")}
      aria-pressed={active}
      className={`flex items-center justify-center rounded-full cursor-pointer shrink-0 ${className}`}
      style={{ width: size, height: size, background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
    >
      <HeartIcon filled={active} />
    </button>
  );
}

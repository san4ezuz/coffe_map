export function Chip({
  label,
  active = false,
  onClick,
  size = "md",
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}) {
  const height = size === "sm" ? 38 : 42;
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full whitespace-nowrap font-medium cursor-pointer transition-colors shrink-0"
      style={{
        height,
        padding: "0 16px",
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        background: active ? "var(--color-primary)" : "var(--color-surface)",
        color: active ? "#fffdf9" : "var(--color-text)",
        border: active ? "1px solid transparent" : "1px solid var(--color-border)",
      }}
    >
      {label}
    </button>
  );
}

export function TagBadge({ label }: { label: string }) {
  return (
    <span
      className="rounded-md font-semibold"
      style={{
        fontSize: 11,
        padding: "4px 8px",
        color: "var(--color-primary-strong)",
        background: "var(--color-primary-tint)",
      }}
    >
      {label}
    </span>
  );
}

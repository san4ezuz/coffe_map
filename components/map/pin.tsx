import type { PlaceCategory } from "@/lib/types";

function Glyph({ category, color }: { category: PlaceCategory; color: string }) {
  if (category === "coffee") {
    return <div style={{ width: 13, height: 11, borderRadius: "2px 2px 6px 6px", background: color }} />;
  }
  if (category === "food") {
    return <div style={{ width: 12, height: 12, borderRadius: "50%", border: `2.5px solid ${color}` }} />;
  }
  return <div style={{ width: 11, height: 11, background: color, transform: "rotate(45deg)", borderRadius: 2 }} />;
}

export function Pin({
  category,
  selected = false,
  onClick,
  style,
}: {
  category: PlaceCategory;
  selected?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  if (selected) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center cursor-pointer"
        style={style}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 48,
            height: 48,
            background: "var(--color-primary)",
            border: "3px solid var(--color-surface)",
          }}
        >
          <Glyph category={category} color="var(--color-surface)" />
        </div>
        <div
          style={{
            width: 12,
            height: 12,
            background: "var(--color-primary)",
            transform: "rotate(45deg)",
            marginTop: -7,
            borderRadius: 2,
          }}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full cursor-pointer transition-transform hover:scale-110"
      style={{
        width: 34,
        height: 34,
        background: "var(--color-surface)",
        border: "1.5px solid var(--color-primary)",
        ...style,
      }}
    >
      <Glyph category={category} color="var(--color-primary)" />
    </button>
  );
}

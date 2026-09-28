import { Chip } from "@/components/ui/chip";
import { TAGS } from "@/lib/places-data";

export function FilterChips({
  active,
  onToggle,
  size = "md",
  className = "",
}: {
  active: string[];
  onToggle: (tag: string) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div className={`flex gap-2 overflow-x-auto no-scrollbar ${className}`}>
      {TAGS.map((tag) => (
        <Chip key={tag} label={tag} active={active.includes(tag)} onClick={() => onToggle(tag)} size={size} />
      ))}
    </div>
  );
}

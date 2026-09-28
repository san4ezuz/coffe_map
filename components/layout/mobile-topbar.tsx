"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { HelpMenu } from "@/components/layout/help-menu";

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="var(--color-text-secondary)" strokeWidth="2" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function MobileTopBar({
  query,
  onQueryChange,
  favoritesOnly,
  onToggleFavoritesOnly,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  favoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
}) {
  return (
    <div className="absolute top-3.5 left-3.5 right-3.5 flex gap-2.5 lg:hidden">
      <div
        className="flex-1 h-[54px] rounded-full flex items-center gap-3 px-5"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <SearchIcon />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Место, тег или район"
          className="flex-1 bg-transparent outline-none text-[15px] min-w-0"
          style={{ color: "var(--color-text)" }}
        />
      </div>
      <FavoriteButton
        active={favoritesOnly}
        onClick={onToggleFavoritesOnly}
        size={54}
        label={favoritesOnly ? "Показать все места" : "Показать только избранное"}
      />
      <ThemeToggle className="w-[54px] h-[54px] shrink-0" />
      <HelpMenu size={54} />
      <Link
        href="/add"
        aria-label="Добавить место"
        className="shrink-0 w-[54px] h-[54px] rounded-full flex items-center justify-center text-xl font-semibold"
        style={{ background: "var(--color-primary)", color: "#fffdf9" }}
      >
        +
      </Link>
    </div>
  );
}

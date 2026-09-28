"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { HelpMenu } from "@/components/layout/help-menu";

export function Header({
  favoritesOnly,
  onToggleFavoritesOnly,
}: {
  favoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
}) {
  return (
    <header
      className="hidden lg:flex h-[70px] shrink-0 items-center justify-between px-6"
      style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}
    >
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="font-semibold"
          style={{ fontFamily: "var(--font-spectral)", fontSize: 24, color: "var(--color-text)" }}
        >
          Mesta
        </Link>
        <nav className="flex gap-6 text-[15px]">
          <Link
            href="/"
            className="font-bold pb-[3px]"
            style={{ color: "var(--color-text)", borderBottom: "2px solid var(--color-primary)" }}
          >
            Карта
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex rounded-full p-[3px]" style={{ background: "var(--color-surface-2)" }}>
          <span
            className="rounded-full font-bold text-[13px] px-3.5 py-1.5"
            style={{ background: "var(--color-surface)", color: "var(--color-text)" }}
          >
            RU
          </span>
          <span className="rounded-full font-semibold text-[13px] px-3.5 py-1.5" style={{ color: "var(--color-text-secondary)" }}>
            ES
          </span>
        </div>
        <FavoriteButton
          active={favoritesOnly}
          onClick={onToggleFavoritesOnly}
          size={44}
          label={favoritesOnly ? "Показать все места" : "Показать только избранное"}
        />
        <ThemeToggle className="w-11 h-11" />
        <HelpMenu size={44} />
        <Link
          href="/add"
          className="h-11 rounded-full flex items-center px-5 font-bold text-[15px]"
          style={{ background: "var(--color-primary)", color: "#fffdf9" }}
        >
          Добавить место
        </Link>
      </div>
    </header>
  );
}

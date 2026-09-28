"use client";

import { useState } from "react";

type Tag = { id: string; label: string };

export function TagEditor({
  placeId,
  initialTags,
  allTags,
}: {
  placeId: string;
  initialTags: Tag[];
  allTags: Tag[];
}) {
  const [tags, setTags] = useState(initialTags);
  const [selectValue, setSelectValue] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const available = allTags.filter((t) => !tags.some((existing) => existing.id === t.id));

  async function detach(tagId: string) {
    const prev = tags;
    setTags((t) => t.filter((x) => x.id !== tagId));
    const res = await fetch("/api/admin/place-tags", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId, tagId }),
    });
    if (!res.ok) {
      setTags(prev);
      setError("Не удалось убрать тег");
    }
  }

  async function attachExisting(tagId: string) {
    const tag = allTags.find((t) => t.id === tagId);
    if (!tag) return;
    setSelectValue("");
    setTags((t) => [...t, tag]);
    const res = await fetch("/api/admin/place-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId, tagId }),
    });
    if (!res.ok) {
      setTags((t) => t.filter((x) => x.id !== tagId));
      setError("Не удалось добавить тег");
    }
  }

  async function attachNew() {
    const label = newLabel.trim();
    if (!label) return;
    setError(null);
    setNewLabel("");
    const res = await fetch("/api/admin/place-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId, newLabel: label }),
    });
    if (!res.ok) {
      setError("Не удалось добавить тег");
      return;
    }
    // Optimistic placeholder id — a real refresh of the page will pick up the canonical
    // tag id; good enough for this admin-only view.
    setTags((t) => [...t, { id: `new:${label}`, label }]);
  }

  return (
    <div className="mt-3">
      <div className="flex gap-1.5 flex-wrap">
        {tags.map((t) => (
          <span
            key={t.id}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
            style={{ background: "var(--color-surface-2)", color: "var(--color-text)" }}
          >
            {t.label}
            <button
              type="button"
              onClick={() => detach(t.id)}
              title="Убрать тег"
              className="cursor-pointer leading-none"
              style={{ color: "var(--color-text-secondary)" }}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {available.length > 0 && (
          <select
            value={selectValue}
            onChange={(e) => {
              if (e.target.value) attachExisting(e.target.value);
            }}
            className="text-xs rounded-full px-2.5 py-1.5 outline-none"
            style={{ background: "var(--color-bg)", border: "1px solid var(--color-border-strong)", color: "var(--color-text)" }}
          >
            <option value="">+ существующий тег</option>
            {available.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        )}
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              attachNew();
            }
          }}
          placeholder="новый тег…"
          className="text-xs rounded-full px-2.5 py-1.5 outline-none"
          style={{ background: "var(--color-bg)", border: "1px solid var(--color-border-strong)", color: "var(--color-text)", width: 120 }}
        />
        <button
          type="button"
          onClick={attachNew}
          className="text-xs rounded-full px-2.5 py-1.5 cursor-pointer"
          style={{ border: "1px solid var(--color-border-strong)", color: "var(--color-text)" }}
        >
          Добавить
        </button>
      </div>
      {error && (
        <p className="text-xs mt-1" style={{ color: "var(--color-danger, #c0392b)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

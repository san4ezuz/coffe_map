"use client";

import { useState } from "react";

interface ImportResult {
  created: string[];
  updated: string[];
  errors: string[];
}

export function ImportForm() {
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);

  async function handleSubmit() {
    setPending(true);
    setResult(null);
    setFatalError(null);
    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFatalError(data.error ?? "Ошибка импорта");
        return;
      }
      setResult(data as ImportResult);
    } catch {
      setFatalError("Ошибка сети");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-5">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        placeholder="name	address	district	lat	lng	tags&#10;Cafe X	Calle Y, 1	Ciutat Vella	39.47	-0.38	веранда, завтраки"
        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none font-mono"
        style={{ background: "var(--color-bg)", border: "1px solid var(--color-border-strong)", color: "var(--color-text)" }}
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={pending || !text.trim()}
        className="mt-3 h-9 px-4 rounded-full font-semibold text-sm cursor-pointer disabled:opacity-50"
        style={{ background: "var(--color-primary)", color: "#fffdf9" }}
      >
        {pending ? "Импортирую…" : "Импортировать"}
      </button>

      {fatalError && (
        <p className="text-sm mt-3" style={{ color: "var(--color-danger, #c0392b)" }}>
          {fatalError}
        </p>
      )}

      {result && (
        <div className="mt-4 rounded-xl p-4 text-sm" style={{ background: "var(--color-surface-2)", color: "var(--color-text)" }}>
          <p>
            Создано: {result.created.length}, обновлено: {result.updated.length}
            {result.errors.length > 0 && `, ошибок: ${result.errors.length}`}
          </p>
          {result.created.length > 0 && (
            <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
              Новые: {result.created.join(", ")}
            </p>
          )}
          {result.updated.length > 0 && (
            <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
              Обновлены: {result.updated.join(", ")}
            </p>
          )}
          {result.errors.length > 0 && (
            <ul className="mt-2 list-disc pl-5" style={{ color: "var(--color-danger, #c0392b)" }}>
              {result.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

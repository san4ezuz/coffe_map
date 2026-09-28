"use client";

import { useState } from "react";
import Link from "next/link";
import { Chip } from "@/components/ui/chip";
import { REASONS } from "@/lib/report-reasons";
import { HONEYPOT_FIELD, FORM_LOADED_AT_FIELD } from "@/lib/honeypot";
import type { Place } from "@/lib/types";

const inputStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border-strong)",
  color: "var(--color-text)",
};

export function ReportProblemForm({ place }: { place: Place }) {
  const [reason, setReason] = useState<string>(REASONS[0].id);
  const [comment, setComment] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [formLoadedAt] = useState(() => Date.now());

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "report_problem",
          placeId: place.id,
          placeSlug: place.slug,
          placeName: place.name,
          reason,
          comment,
          contact,
          [HONEYPOT_FIELD]: honeypot,
          [FORM_LOADED_AT_FIELD]: formLoadedAt,
        }),
      });
      if (!res.ok) throw new Error(`request failed: ${res.status}`);
      setSubmitted(true);
    } catch {
      setError("Не получилось отправить. Проверьте связь и попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div
          className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-3xl"
          style={{ background: "var(--color-primary)", color: "#fffdf9" }}
        >
          ✓
        </div>
        <div className="font-semibold mt-6 leading-tight" style={{ fontFamily: "var(--font-spectral)", fontSize: 26, color: "var(--color-text)" }}>
          Спасибо, разберёмся
        </div>
        <div className="text-[15px] mt-3 leading-[1.6]" style={{ color: "var(--color-text-secondary)" }}>
          Проверим {place.name} в ближайшее время.
        </div>
        <Link
          href={`/valencia/coffee/${place.slug}`}
          className="mt-6 h-12 flex items-center justify-center font-semibold text-[15px]"
          style={{ color: "var(--color-primary)" }}
        >
          Вернуться к месту
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-5 pt-5 pb-6">
      <input
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }}
      />
      <div>
        <div className="text-[13px] font-bold mb-2" style={{ color: "var(--color-text)" }}>Что не так?</div>
        <div className="flex gap-2 flex-wrap">
          {REASONS.map((r) => (
            <Chip key={r.id} label={r.label} active={reason === r.id} onClick={() => setReason(r.id)} size="sm" />
          ))}
        </div>
      </div>

      <div>
        <div className="text-[13px] font-bold mb-2" style={{ color: "var(--color-text)" }}>
          Комментарий <span className="font-medium" style={{ color: "var(--color-text-secondary)" }}>· необязательно</span>
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Например: закрыто с апреля"
          rows={3}
          className="rounded-2xl px-4 py-3.5 text-[15px] w-full outline-none resize-none"
          style={inputStyle}
        />
      </div>

      <div>
        <div className="text-[13px] font-bold mb-2" style={{ color: "var(--color-text)" }}>
          Как связаться <span className="font-medium" style={{ color: "var(--color-text-secondary)" }}>· необязательно</span>
        </div>
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="@username или email"
          className="h-[54px] rounded-2xl px-4 text-base w-full outline-none"
          style={inputStyle}
        />
      </div>

      <button
        type="button"
        disabled={submitting}
        onClick={submit}
        className="h-[54px] w-full rounded-full font-bold text-base cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: "var(--color-primary)", color: "#fffdf9" }}
      >
        {submitting ? "Отправляем…" : "Отправить"}
      </button>
      {error && (
        <div className="text-center text-sm -mt-2.5" style={{ color: "var(--color-primary-strong)" }}>
          {error}
        </div>
      )}
    </div>
  );
}

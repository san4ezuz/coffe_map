"use client";

import { useState } from "react";
import Link from "next/link";
import { Chip } from "@/components/ui/chip";
import { TAGS } from "@/lib/places-data";
import { HONEYPOT_FIELD, FORM_LOADED_AT_FIELD } from "@/lib/honeypot";

const PLACE_TYPE = "Кофейня";

function StepShell({
  step,
  title,
  subtitle,
  onBack,
  children,
  footer,
}: {
  step: number;
  title: string;
  subtitle: string;
  onBack?: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-5 pt-6 shrink-0">
        <div className="flex items-center justify-between">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Назад"
              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            >
              <div style={{ width: 10, height: 10, borderLeft: "2px solid var(--color-text)", borderBottom: "2px solid var(--color-text)", transform: "rotate(45deg)", marginLeft: 3 }} />
            </button>
          ) : (
            <Link
              href="/"
              aria-label="Закрыть"
              className="w-10 h-10 rounded-full flex items-center justify-center text-base"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
            >
              ×
            </Link>
          )}
          <div className="text-[13px] font-semibold" style={{ color: "var(--color-text-secondary)" }}>
            Шаг {step} из 3
          </div>
        </div>
        <div className="flex gap-1.5 mt-4.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full"
              style={{ background: i <= step ? "var(--color-primary)" : "var(--color-surface-2)" }}
            />
          ))}
        </div>
        <div className="font-semibold mt-5.5 leading-tight" style={{ fontFamily: "var(--font-spectral)", fontSize: 27, color: "var(--color-text)" }}>
          {title}
        </div>
        <div className="text-[15px] mt-2 leading-[1.5]" style={{ color: "var(--color-text-tertiary)" }}>
          {subtitle}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-5 flex flex-col gap-5">{children}</div>
      <div className="shrink-0 px-5 pt-4 pb-6" style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)" }}>
        {footer}
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[13px] font-bold mb-2" style={{ color: "var(--color-text)" }}>
        {label} {hint && <span className="font-medium" style={{ color: "var(--color-text-secondary)" }}>· {hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border-strong)",
  color: "var(--color-text)",
};

export function AddPlaceWizard() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [formLoadedAt] = useState(() => Date.now());

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function resetAll() {
    setStep(1);
    setSubmitted(false);
    setSubmitError(null);
    setName("");
    setAddress("");
    setTags([]);
    setDescription("");
    setContact("");
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "add_place",
          name,
          type: PLACE_TYPE,
          address,
          tags,
          description,
          contact,
          [HONEYPOT_FIELD]: honeypot,
          [FORM_LOADED_AT_FIELD]: formLoadedAt,
        }),
      });
      if (!res.ok) throw new Error(`request failed: ${res.status}`);
      setSubmitted(true);
    } catch {
      setSubmitError("Не получилось отправить. Проверьте связь и попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex justify-end px-5 pt-6 shrink-0">
          <Link
            href="/"
            aria-label="Закрыть"
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
          >
            ×
          </Link>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div
            className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-3xl"
            style={{ background: "var(--color-primary)", color: "#fffdf9" }}
          >
            ✓
          </div>
          <div className="font-semibold mt-6 leading-tight" style={{ fontFamily: "var(--font-spectral)", fontSize: 28, color: "var(--color-text)" }}>
            Получили, спасибо
          </div>
          <div className="text-[15px] mt-3 leading-[1.6]" style={{ color: "var(--color-text-secondary)" }}>
            Посмотрим место в течение пары дней — иногда заходим сами, чтобы проверить. Напишем, когда опубликуем.
          </div>
          <div
            className="mt-6.5 rounded-2xl px-4 py-3.5 flex gap-3 items-center text-left"
            style={{ background: "var(--color-surface-2)" }}
          >
            <div
              className="w-9 h-9 shrink-0 rounded-[9px]"
              style={{ backgroundImage: "repeating-linear-gradient(135deg, var(--color-skeleton) 0 5px, var(--color-skeleton-2) 5px 10px)" }}
            />
            <div>
              <div className="text-sm font-bold" style={{ color: "var(--color-text)" }}>{name || "Новое место"}</div>
              <div className="text-[13px] mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{PLACE_TYPE} · на модерации</div>
            </div>
          </div>
        </div>
        <div className="shrink-0 px-5 pt-4 pb-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={resetAll}
            className="h-[54px] rounded-full font-semibold text-base cursor-pointer"
            style={{ border: "1px solid var(--color-border-strong)", color: "var(--color-text)" }}
          >
            Добавить ещё место
          </button>
          <Link
            href="/"
            className="h-12 flex items-center justify-center font-semibold text-[15px]"
            style={{ color: "var(--color-primary)" }}
          >
            Вернуться на карту
          </Link>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <StepShell
        step={1}
        title="Что за место?"
        subtitle="Пара вопросов — остальное соберём сами. Займёт минуту."
        footer={
          <>
            <button
              type="button"
              disabled={!name.trim() || !address.trim()}
              onClick={() => setStep(2)}
              className="h-[54px] w-full rounded-full font-bold text-base cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--color-primary)", color: "#fffdf9" }}
            >
              Дальше
            </button>
            <div className="text-center text-xs mt-2.5" style={{ color: "var(--color-text-secondary)" }}>
              Мы проверяем каждое место перед публикацией
            </div>
          </>
        }
      >
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
        <Field label="Название">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например, Café Nube"
            className="h-[54px] rounded-2xl px-4 text-base w-full outline-none"
            style={inputStyle}
          />
        </Field>
        <Field label="Адрес">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Улица, номер дома"
            className="h-[54px] rounded-2xl px-4 text-base w-full outline-none"
            style={inputStyle}
          />
        </Field>
      </StepShell>
    );
  }

  if (step === 2) {
    return (
      <StepShell
        step={2}
        title="Чем оно хорошо?"
        subtitle="Отметьте теги и напишите пару строк — как рассказали бы другу."
        onBack={() => setStep(1)}
        footer={
          <button
            type="button"
            onClick={() => setStep(3)}
            className="h-[54px] w-full rounded-full font-bold text-base cursor-pointer"
            style={{ background: "var(--color-primary)", color: "#fffdf9" }}
          >
            Дальше
          </button>
        }
      >
        <Field label="Теги">
          <div className="flex gap-2 flex-wrap">
            {TAGS.map((t) => (
              <Chip key={t} label={t} active={tags.includes(t)} onClick={() => toggleTag(t)} size="sm" />
            ))}
          </div>
        </Field>
        <Field label="Пара строк о месте">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Например: «маленькая обжарка, во дворе тихая веранда»"
            rows={3}
            className="rounded-2xl px-4 py-3.5 text-[15px] w-full outline-none resize-none"
            style={inputStyle}
          />
        </Field>
        <Field label="Фото" hint="необязательно">
          <div className="flex gap-2.5">
            <div
              className="w-[82px] h-[82px] rounded-xl border-dashed flex items-center justify-center text-2xl cursor-pointer"
              style={{ border: "1.5px dashed var(--color-border-strong)", color: "var(--color-text-secondary)" }}
            >
              +
            </div>
          </div>
        </Field>
      </StepShell>
    );
  }

  return (
    <StepShell
      step={3}
      title="Как с вами связаться?"
      subtitle="Только чтобы уточнить детали перед публикацией — не покажем на карте."
      onBack={() => setStep(2)}
      footer={
        <>
          <button
            type="button"
            disabled={!contact.trim() || submitting}
            onClick={submit}
            className="h-[54px] w-full rounded-full font-bold text-base cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "var(--color-primary)", color: "#fffdf9" }}
          >
            {submitting ? "Отправляем…" : "Отправить на модерацию"}
          </button>
          {submitError && (
            <div className="text-center text-sm mt-2.5" style={{ color: "var(--color-primary-strong)" }}>
              {submitError}
            </div>
          )}
        </>
      }
    >
      <Field label="Telegram, email или телефон">
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="@username или email"
          className="h-[54px] rounded-2xl px-4 text-base w-full outline-none"
          style={inputStyle}
        />
      </Field>
    </StepShell>
  );
}

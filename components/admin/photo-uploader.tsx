"use client";

import { useRef, useState, type MouseEvent } from "react";

export function PhotoUploader({
  placeId,
  initialPhotos,
  initialFocal,
}: {
  placeId: string;
  initialPhotos: string[];
  initialFocal: { x: number; y: number };
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [focal, setFocal] = useState(initialFocal);
  const [pending, setPending] = useState(0);
  const [savingFocal, setSavingFocal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadOne(file: File) {
    const formData = new FormData();
    formData.set("id", placeId);
    formData.set("photo", file);
    const res = await fetch("/api/admin/photos", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Ошибка загрузки");
    setPhotos((prev) => [...prev, data.url as string]);
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    const list = Array.from(files);
    setPending((n) => n + list.length);
    for (const file of list) {
      try {
        await uploadOne(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки");
      } finally {
        setPending((n) => n - 1);
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete(url: string) {
    setError(null);
    const prev = photos;
    setPhotos((p) => p.filter((u) => u !== url));
    try {
      const res = await fetch("/api/admin/photos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: placeId, url }),
      });
      if (!res.ok) throw new Error("Ошибка удаления");
    } catch (err) {
      setPhotos(prev);
      setError(err instanceof Error ? err.message : "Ошибка удаления");
    }
  }

  async function handleFocalClick(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setFocal({ x, y });
    setSavingFocal(true);
    try {
      const res = await fetch("/api/admin/cover-focal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: placeId, x, y }),
      });
      if (!res.ok) throw new Error("Ошибка сохранения фокуса");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения фокуса");
    } finally {
      setSavingFocal(false);
    }
  }

  return (
    <div className="mt-2">
      {photos.length > 0 && (
        <div className="flex gap-4 mt-1 items-start flex-wrap">
          <div>
            <div
              onClick={handleFocalClick}
              title="Кликните, чтобы задать центр обрезки для карточки"
              className="relative cursor-crosshair rounded-lg overflow-hidden"
              style={{ width: 140, height: 140, border: "1px solid var(--color-border-strong)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary R2 URLs */}
              <img
                src={photos[0]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: `${focal.x}% ${focal.y}%` }}
              />
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: `${focal.x}%`,
                  top: `${focal.y}%`,
                  width: 14,
                  height: 14,
                  marginLeft: -7,
                  marginTop: -7,
                  border: "2px solid #fff",
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
                }}
              />
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
              {savingFocal ? "Сохранение…" : "Клик — центр фото в карточке"}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {photos.map((url) => (
              <div key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary R2 URLs */}
                <img src={url} alt="" className="rounded-lg object-cover" style={{ width: 80, height: 60 }} />
                <button
                  type="button"
                  onClick={() => handleDelete(url)}
                  title="Удалить фото"
                  className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full cursor-pointer text-xs"
                  style={{ width: 20, height: 20, background: "var(--color-surface)", border: "1px solid var(--color-border-strong)" }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mt-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          disabled={pending > 0}
          className="text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        />
        {pending > 0 && (
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            Загрузка {pending}…
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs mt-1" style={{ color: "var(--color-danger, #c0392b)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";

export function PhotoUploader({ placeId, initialPhotos }: { placeId: string; initialPhotos: string[] }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [pending, setPending] = useState(0);
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

  return (
    <div className="mt-2">
      {photos.length > 0 && (
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

import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAllPlacesForAdmin, updatePlaceAdmin } from "@/db/admin-places";
import { PhotoUploader } from "@/components/admin/photo-uploader";

export const revalidate = 0;

async function saveAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const descriptionRu = (formData.get("descriptionRu") as string) ?? "";
  await updatePlaceAdmin(id, { descriptionRu });
  revalidatePath("/admin/places");
  revalidatePath("/");
  redirect("/admin/places?ok=1");
}

export default async function AdminPlacesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const places = await getAllPlacesForAdmin();

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-6 py-8 max-w-[720px] mx-auto w-full">
      <div className="flex items-baseline justify-between">
        <h1 className="font-semibold text-2xl" style={{ fontFamily: "var(--font-spectral)", color: "var(--color-text)" }}>
          Места на карте
        </h1>
        <Link href="/admin" className="text-sm underline" style={{ color: "var(--color-primary-strong)" }}>
          Модерация заявок
        </Link>
      </div>
      <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
        Редактируйте описание для уже опубликованных мест.
      </p>

      {ok && (
        <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: "var(--color-surface-2)", color: "var(--color-text)" }}>
          Сохранено.
        </div>
      )}

      <div className="flex flex-col gap-4 mt-6">
        {places.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl p-4"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
          <form action={saveAction}>
            <input type="hidden" name="id" value={p.id} />
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-bold text-base" style={{ color: "var(--color-text)" }}>
                {p.name}
              </span>
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{p.status}</span>
            </div>
            <textarea
              name="descriptionRu"
              defaultValue={p.descriptionRu ?? ""}
              rows={3}
              placeholder="Описание места"
              className="w-full mt-3 rounded-xl px-3 py-2.5 text-sm resize-none outline-none"
              style={{ background: "var(--color-bg)", border: "1px solid var(--color-border-strong)", color: "var(--color-text)" }}
            />
            <button
              type="submit"
              className="mt-3 h-9 px-4 rounded-full font-semibold text-sm cursor-pointer"
              style={{ background: "var(--color-primary)", color: "#fffdf9" }}
            >
              Сохранить
            </button>
          </form>

          <PhotoUploader placeId={p.id} initialPhotos={(p.photos as string[] | null) ?? []} />
          </div>
        ))}
      </div>
    </div>
  );
}

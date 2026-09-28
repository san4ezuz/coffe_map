import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAllPlacesForAdmin, updatePlaceAdmin, addPlacePhoto, removePlacePhoto } from "@/db/admin-places";
import { uploadPlacePhoto, deletePlacePhoto } from "@/lib/r2";

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

async function uploadPhotoAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const file = formData.get("photo") as File | null;
  if (file && file.size > 0) {
    const url = await uploadPlacePhoto(id, file);
    await addPlacePhoto(id, url);
  }
  revalidatePath("/admin/places");
  revalidatePath("/");
  redirect("/admin/places?ok=1");
}

async function deletePhotoAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const url = formData.get("url") as string;
  await deletePlacePhoto(url);
  await removePlacePhoto(id, url);
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

            {((p.photos as string[] | null)?.length ?? 0) > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {(p.photos as string[]).map((url) => (
                  <div key={url} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary R2 URLs */}
                    <img src={url} alt="" className="rounded-lg object-cover" style={{ width: 80, height: 60 }} />
                    <button
                      type="submit"
                      formAction={deletePhotoAction}
                      name="url"
                      value={url}
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
          </form>

          <form action={uploadPhotoAction} className="flex items-center gap-2 mt-2" encType="multipart/form-data">
            <input type="hidden" name="id" value={p.id} />
            <input
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/webp"
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            />
            <button
              type="submit"
              className="h-8 px-3 rounded-full font-semibold text-xs cursor-pointer shrink-0"
              style={{ border: "1px solid var(--color-border-strong)", color: "var(--color-text)" }}
            >
              Загрузить фото
            </button>
          </form>
          </div>
        ))}
      </div>
    </div>
  );
}

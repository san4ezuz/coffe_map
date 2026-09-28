import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getPendingSubmissions, approveSubmission, rejectSubmission, resolveReportProblem } from "@/db/moderation";
import { REASONS } from "@/lib/report-reasons";

export const revalidate = 0;

interface AddPlacePayload {
  name: string;
  type: string;
  address: string;
  tags: string[];
  description: string;
  contact: string;
}

interface ReportProblemPayload {
  placeId: string;
  placeSlug: string;
  placeName: string;
  reason: string;
  comment: string;
  contact: string;
}

function reasonLabel(id: string) {
  return REASONS.find((r) => r.id === id)?.label ?? id;
}

async function approveAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const type = formData.get("type") as string;

  if (type === "report_problem") {
    await resolveReportProblem(id);
    revalidatePath("/admin");
    redirect("/admin?ok=resolved");
  }

  const result = await approveSubmission(id);
  revalidatePath("/admin");
  if (!result.ok) {
    redirect(`/admin?error=${encodeURIComponent(result.error)}`);
  }
  redirect(`/admin?ok=${encodeURIComponent(result.placeSlug)}`);
}

async function rejectAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await rejectSubmission(id);
  revalidatePath("/admin");
  redirect("/admin");
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  const pending = await getPendingSubmissions();

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-6 py-8 max-w-[720px] mx-auto w-full">
      <div className="flex items-baseline justify-between">
        <h1 className="font-semibold text-2xl" style={{ fontFamily: "var(--font-spectral)", color: "var(--color-text)" }}>
          Модерация заявок
        </h1>
        <a href="/admin/places" className="text-sm underline" style={{ color: "var(--color-primary-strong)" }}>
          Редактировать места
        </a>
      </div>
      <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
        {pending.length === 0 ? "Очередь пуста." : `Ожидают проверки: ${pending.length}`}
      </p>

      {error && (
        <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: "var(--color-primary-tint)", color: "var(--color-primary-strong)" }}>
          {error}
        </div>
      )}
      {ok && (
        <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: "var(--color-surface-2)", color: "var(--color-text)" }}>
          {ok === "resolved" ? (
            "Отмечено как решено."
          ) : (
            <>
              Опубликовано: <a href={`/valencia/coffee/${ok}`} className="underline">{ok}</a>
            </>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 mt-6">
        {pending.map((s) => {
          const isReport = s.type === "report_problem";
          const addPayload = !isReport ? (s.payload as AddPlacePayload) : null;
          const reportPayload = isReport ? (s.payload as ReportProblemPayload) : null;

          return (
            <div key={s.id} className="rounded-2xl p-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-bold text-base" style={{ color: "var(--color-text)" }}>
                  {isReport ? `Проблема: ${reportPayload!.placeName}` : addPayload!.name}
                </span>
                <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  {new Date(s.createdAt).toLocaleString("ru-RU")}
                </span>
              </div>

              {isReport ? (
                <>
                  <div className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    {reasonLabel(reportPayload!.reason)}
                  </div>
                  {reportPayload!.comment && (
                    <div className="text-sm mt-2" style={{ color: "var(--color-body-text)" }}>{reportPayload!.comment}</div>
                  )}
                  <div className="text-xs mt-2" style={{ color: "var(--color-text-secondary)" }}>
                    <a href={`/valencia/coffee/${reportPayload!.placeSlug}`} className="underline">Открыть место</a>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    {addPayload!.type} · {addPayload!.address}
                  </div>
                  {addPayload!.description && (
                    <div className="text-sm mt-2" style={{ color: "var(--color-body-text)" }}>{addPayload!.description}</div>
                  )}
                  {addPayload!.tags?.length > 0 && (
                    <div className="text-xs mt-2" style={{ color: "var(--color-text-secondary)" }}>
                      Теги: {addPayload!.tags.join(", ")}
                    </div>
                  )}
                </>
              )}
              {(isReport ? reportPayload!.contact : addPayload!.contact) && (
                <div className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
                  Контакт: {isReport ? reportPayload!.contact : addPayload!.contact}
                </div>
              )}

              <div className="flex gap-2.5 mt-3.5">
                <form action={approveAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="type" value={s.type} />
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-full font-semibold text-sm cursor-pointer"
                    style={{ background: "var(--color-primary)", color: "#fffdf9" }}
                  >
                    {isReport ? "Решено" : "Одобрить"}
                  </button>
                </form>
                <form action={rejectAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-full font-semibold text-sm cursor-pointer"
                    style={{ border: "1px solid var(--color-border-strong)", color: "var(--color-text)" }}
                  >
                    Отклонить
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

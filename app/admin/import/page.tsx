import Link from "next/link";
import { ImportForm } from "@/components/admin/import-form";

export const revalidate = 0;

export default function AdminImportPage() {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-6 py-8 max-w-[720px] mx-auto w-full">
      <div className="flex items-baseline justify-between">
        <h1 className="font-semibold text-2xl" style={{ fontFamily: "var(--font-spectral)", color: "var(--color-text)" }}>
          Импорт мест
        </h1>
        <Link href="/admin/places" className="text-sm underline" style={{ color: "var(--color-primary-strong)" }}>
          Назад к местам
        </Link>
      </div>

      <div className="text-sm mt-3 leading-[1.6]" style={{ color: "var(--color-text-secondary)" }}>
        <p>
          Вставьте таблицу из Excel/Google Sheets (первая строка — заголовки столбцов). Разделитель —
          табуляция, как при обычном копировании ячеек; можно и CSV с запятыми.
        </p>
        <p className="mt-2">
          Обязательные столбцы: <code>name</code>, <code>address</code>, <code>lat</code>, <code>lng</code>.
          Необязательные: <code>district</code>, <code>phone</code>, <code>whatsapp</code>,{" "}
          <code>instagram</code>, <code>googleMapsUrl</code>, <code>hours</code>, <code>description</code>,{" "}
          <code>tags</code> (теги через <code>;</code> или <code>,</code>).
        </p>
        <p className="mt-2">
          Место с таким же <code>name</code>, как уже существующее, будет обновлено, а не задублировано.
        </p>
      </div>

      <ImportForm />
    </div>
  );
}

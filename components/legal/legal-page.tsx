import Link from "next/link";

export function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto" style={{ background: "var(--color-bg)" }}>
      <div className="max-w-[640px] mx-auto w-full px-6 py-10">
        <Link
          href="/"
          className="text-[14px] font-semibold inline-block mb-6"
          style={{ color: "var(--color-primary-strong)" }}
        >
          ← На карту
        </Link>
        <h1
          className="font-semibold leading-tight"
          style={{ fontFamily: "var(--font-spectral)", fontSize: 32, color: "var(--color-text)" }}
        >
          {title}
        </h1>
        {updatedAt && (
          <div className="text-[13px] mt-2" style={{ color: "var(--color-text-secondary)" }}>
            Обновлено: {updatedAt}
          </div>
        )}
        <div
          className="mt-6 flex flex-col gap-4 text-[15px] leading-[1.65]"
          style={{ color: "var(--color-body-text)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

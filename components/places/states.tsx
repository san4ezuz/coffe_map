export function PlaceListSkeleton() {
  return (
    <div className="flex gap-3 px-1 overflow-hidden">
      {[0, 1].map((i) => (
        <div key={i} className="w-[236px] shrink-0 animate-pulse">
          <div className="h-[118px] rounded-xl" style={{ background: "var(--color-skeleton)" }} />
          <div className="h-[14px] rounded-[5px] mt-3" style={{ width: 170 - i * 30, background: "var(--color-skeleton)" }} />
          <div className="h-3 rounded-[5px] mt-2" style={{ width: 118 - i * 18, background: "var(--color-skeleton-2)" }} />
          {i === 0 && (
            <div className="flex gap-1.5 mt-2.5">
              <div className="h-[22px] w-16 rounded-md" style={{ background: "var(--color-skeleton-2)" }} />
              <div className="h-[22px] w-13" style={{ width: 52, background: "var(--color-skeleton-2)", borderRadius: 6 }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function EmptyFilterState({
  activeTagCount,
  totalCount,
  onReset,
}: {
  activeTagCount: number;
  totalCount: number;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-6">
      <div className="flex items-center">
        <div
          className="rounded-full"
          style={{ width: 34, height: 34, border: "1.5px solid var(--color-border-strong)", background: "var(--color-surface)" }}
        />
        <div
          className="rounded-full -ml-2.5"
          style={{ width: 34, height: 34, border: "1.5px solid var(--color-border-strong)", background: "var(--color-surface)" }}
        />
        <div
          className="rounded-full -ml-2.5"
          style={{ width: 34, height: 34, border: "1.5px dashed var(--color-primary)" }}
        />
      </div>
      <div className="font-semibold mt-4.5" style={{ fontFamily: "var(--font-spectral)", fontSize: 21, color: "var(--color-text)" }}>
        Пока пусто в этом углу
      </div>
      <div className="text-sm mt-2 leading-[1.5]" style={{ color: "var(--color-text-tertiary)" }}>
        Ни одного места с выбранными тегами{activeTagCount > 1 ? ` (${activeTagCount})` : ""} рядом. Попробуйте убрать
        тег или отодвиньте карту.
      </div>
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={onReset}
          className="h-11 rounded-full px-4.5 text-sm font-bold cursor-pointer"
          style={{ background: "var(--color-primary)", color: "#fffdf9" }}
        >
          Сбросить теги
        </button>
        <button
          type="button"
          onClick={onReset}
          className="h-11 rounded-full px-4.5 text-sm font-semibold cursor-pointer"
          style={{ border: "1px solid var(--color-border-strong)", color: "var(--color-text)" }}
        >
          Смотреть все {totalCount}
        </button>
      </div>
    </div>
  );
}

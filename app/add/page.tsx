import { AddPlaceWizard } from "@/components/add-place/wizard";

export default function AddPlacePage() {
  return (
    <div className="flex flex-1 min-h-0 items-center justify-center" style={{ background: "var(--color-bg)" }}>
      <div
        className="w-full h-full lg:h-[760px] lg:max-w-[440px] lg:rounded-[32px] lg:border overflow-hidden flex flex-col"
        style={{ background: "var(--color-bg)", borderColor: "var(--color-border-strong)" }}
      >
        <AddPlaceWizard />
      </div>
    </div>
  );
}

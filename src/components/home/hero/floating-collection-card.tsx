export function FloatingCollectionCard() {
  return (
    <div className="relative z-10 ml-4 -mt-6 inline-flex w-fit max-w-[calc(100%-2rem)] items-center gap-3 rounded-xl bg-surface-white p-3 shadow-lg sm:ml-6">
      <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success-100 text-success-500">
        <span className="material-symbols-outlined text-[18px]">bolt</span>
      </span>
      <p className="leading-tight">
        <span className="block text-label-md font-label-md font-bold text-graphite-900">Sub-2hr Click &amp; Collect</span>
        <span className="block text-label-sm font-label-sm text-text-secondary">Available across 240 branches</span>
      </p>
    </div>
  );
}

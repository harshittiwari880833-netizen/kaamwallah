export function SkeletonBlock({ className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-200/80 ${className}`}>
      <div className="absolute inset-y-0 left-0 w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
    </div>
  );
}

export function WorkerCardSkeleton() {
  return (
    <div className="min-w-[280px] rounded-[2rem] bg-white p-5 shadow-soft sm:min-w-[320px]">
      <SkeletonBlock className="h-4 w-24" />
      <SkeletonBlock className="mt-4 h-8 w-40" />
      <SkeletonBlock className="mt-3 h-4 w-28" />
      <div className="mt-6 flex gap-2">
        <SkeletonBlock className="h-8 w-20" />
        <SkeletonBlock className="h-8 w-20" />
      </div>
      <div className="mt-8 flex items-center justify-between">
        <SkeletonBlock className="h-10 w-24" />
        <SkeletonBlock className="h-11 w-24" />
      </div>
    </div>
  );
}

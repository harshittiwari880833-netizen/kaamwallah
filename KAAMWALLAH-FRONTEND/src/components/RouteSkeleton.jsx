export default function RouteSkeleton() {
  return (
    <div className="space-y-6">
      <div className="surface-card h-40 animate-pulse bg-white/80" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="surface-card h-48 animate-pulse bg-white/80" />
        <div className="surface-card h-48 animate-pulse bg-white/80" />
      </div>
      <div className="surface-card h-64 animate-pulse bg-white/80" />
    </div>
  );
}

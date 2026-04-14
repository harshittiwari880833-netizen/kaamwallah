export default function EmptyState({
  title,
  description,
  actionLabel,
  action,
}) {
  return (
    <div className="surface-card flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-100 to-cyan-100 text-3xl">
        ⌁
      </div>
      <h3 className="mt-5 font-display text-2xl font-extrabold text-slate-900">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {actionLabel ? (
        <button type="button" className="gradient-button mt-6" onClick={action}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

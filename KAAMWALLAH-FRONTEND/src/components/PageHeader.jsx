export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="surface-card px-5 py-7 sm:px-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 font-display text-3xl font-extrabold text-slate-950 sm:text-4xl">
            {title}
          </h1>
          {description ? <p className="mt-3 max-w-2xl section-copy">{description}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
    </div>
  );
}

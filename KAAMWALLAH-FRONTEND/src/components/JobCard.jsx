import { memo } from 'react';
import { useAppContext } from '../context/AppContext';

function UrgencyBadge({ urgency }) {
  const map = {
    'Urgent': 'status-urgent',
    'Today': 'status-today',
    'Flexible': 'status-flexible',
    'Completed': 'status-completed',
    'In progress': 'status-progress',
    'Accepted': 'status-today',
  };
  const cls = map[urgency] || 'badge-gray';
  return <span className={cls}>{urgency}</span>;
}

function JobCard({ job, actionLabel = 'View Details', onAction, showActions = false, onAccept, onReject }) {
  const { role, t } = useAppContext();

  return (
    <article 
      onClick={() => onAction?.(job)}
      className="surface-card p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_48px_-16px_rgba(6,182,212,0.25)] cursor-pointer"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 min-w-0">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-700">
              {job.category}
            </span>
            <UrgencyBadge urgency={job.urgency || job.status} />
          </div>

          {/* Title */}
          <h3 className="mt-3 text-xl font-extrabold text-slate-900 leading-tight">
            {job.title}
          </h3>

          {/* Description */}
          {job.description && (
            <p className="mt-2 text-sm leading-6 text-slate-500 line-clamp-2">{job.description}</p>
          )}

          {/* Meta */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">📍 {job.location}</span>
            {job.postedBy && (
              <span className="flex items-center gap-1">👤 {job.postedBy}</span>
            )}
          </div>
        </div>

        {/* Budget + Action */}
        <div className="flex-shrink-0">
          <div className="glass-card min-w-[160px] p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Budget</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{job.budget}</p>

            {/* Worker role: show accept/reject OR custom action */}
            {showActions && role === 'worker' ? (
              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => onAccept?.(job)}
                  className="w-full rounded-xl bg-emerald-500 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition"
                >
                  {t('accept')}
                </button>
                <button
                  type="button"
                  onClick={() => onReject?.(job)}
                  className="w-full rounded-xl bg-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-300 transition"
                >
                  {t('reject')}
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="gradient-button mt-3 w-full text-sm"
                onClick={() => onAction?.(job)}
              >
                {actionLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(JobCard);

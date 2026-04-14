import { memo } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';

function JobDetailModal({ job, onClose, onAccept, onReject, onComplete, actionLabel }) {
  const { role } = useAppContext();

  if (!job) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-panel max-w-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
        >
          ✕
        </button>

        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">{job.category}</p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900 leading-tight">{job.title}</h2>
          
          <div className="mt-3 flex items-center gap-2">
            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
              job.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
              job.status === 'Accepted' ? 'bg-cyan-100 text-cyan-800' :
              'bg-amber-100 text-amber-800'
            }`}>
              {job.status || 'Pending'}
            </span>
            {job.urgency && job.urgency === 'Urgent' && (
              <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                🔥 Urgent
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Description</p>
            <p className="mt-1 text-sm text-slate-700 leading-6">{job.description || 'No description provided.'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Budget</p>
              <p className="mt-1 text-xl font-extrabold text-slate-900">{job.budget}</p>
            </div>
            
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Duration</p>
              <p className="mt-1 text-base font-bold text-slate-900">{job.duration || 'Not specified'}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
             <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Details</p>
             <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-slate-400">👤</span>
                  <span className="text-sm font-semibold text-slate-700">
                     {role === 'worker' ? `Client: ${job.postedBy || 'User'}` : `Worker Assigned: ${job.assignedWorkerId || 'None yet'}`}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-slate-400">📍</span>
                  <div className="flex-1">
                     <span className="text-sm font-semibold text-slate-700">{job.location}</span>
                     <button
                        onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(job.location)}`, '_blank')}
                        className="block mt-1 text-xs font-bold text-cyan-600 hover:text-cyan-800"
                     >
                        Open in Google Maps ↗
                     </button>
                  </div>
                </div>
             </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          {role === 'worker' && (!job.status || job.status === 'Pending') && (
            <>
              <button
                type="button"
                onClick={() => { onAccept?.(job); onClose(); }}
                className="flex-1 gradient-button"
              >
                Accept Job
              </button>
              <button
                type="button"
                onClick={() => { onReject?.(job); onClose(); }}
                className="flex-1 secondary-button"
              >
                Reject
              </button>
            </>
          )}
          {role === 'worker' && ['Accepted', 'In progress'].includes(job.status) && (
             <button
                type="button"
                onClick={() => { onComplete?.(job); onClose(); }}
                className="flex-1 gradient-button"
             >
                Mark as Completed
             </button>
          )}
          {role === 'client' && (
             <button type="button" onClick={onClose} className="w-full secondary-button">Close</button>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}

export default memo(JobDetailModal);

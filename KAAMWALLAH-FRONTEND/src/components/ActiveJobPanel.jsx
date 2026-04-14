import { memo } from 'react';
import { updateJobStatus } from '../services/jobs';
import { useAppContext } from '../context/AppContext';

function ActiveJobPanel({ job, onStatusChange }) {
  const { t, addNotification } = useAppContext();

  if (!job) return null;

  async function handleComplete() {
    await updateJobStatus(job.id, 'Completed');
    addNotification({
       type: 'job_completed',
       title: 'Job Completed',
       message: `You marked ${job.title} as completed!`
    });
    onStatusChange?.();
  }

  return (
    <div className="surface-card bg-gradient-to-r from-sky-50 to-indigo-50 border-cyan-200 border-2 p-6 animate-scale-in mb-6 shadow-[0_16px_40px_-16px_rgba(34,211,238,0.4)] relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-9xl">🛠️</div>
      <div className="flex items-center justify-between mb-4">
        <span className="bg-cyan-500 text-white rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-md shadow-cyan-200 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          Active Job
        </span>
      </div>

      <h2 className="text-2xl font-extrabold text-slate-900 leading-tight pr-10">{job.title}</h2>
      <p className="mt-1 text-sm text-slate-600 font-semibold">{job.category} • Budget: {job.budget}</p>

      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-1">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Client Details</p>
          <p className="text-base font-extrabold text-slate-900">{job.postedBy || 'Kaam Client'}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg">📞</span>
            <span className="text-sm font-bold text-slate-700">{job.clientPhone || '+91 9876543210'}</span>
          </div>
          <button onClick={() => window.location.href = `tel:${job.clientPhone || '+919876543210'}`} className="mt-2 text-xs font-bold text-cyan-600 self-start">Call Client</button>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-1">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Location</p>
          <p className="text-sm font-semibold text-slate-700 mt-1 line-clamp-2">{job.location}</p>
          <button 
            onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(job.location)}`, '_blank')} 
            className="mt-3 flex items-center justify-center gap-2 w-full bg-slate-900 text-white rounded-xl py-2 text-sm font-bold shadow-md hover:bg-slate-800 transition"
          >
            📍 Open in Google Maps
          </button>
        </div>
      </div>

      <div className="mt-5 border-t border-cyan-100/50 pt-5 flex justify-end">
         <button onClick={handleComplete} className="gradient-button shrink-0 shadow-lg shadow-cyan-200">
           Mark as Completed ✅
         </button>
      </div>
    </div>
  );
}

export default memo(ActiveJobPanel);

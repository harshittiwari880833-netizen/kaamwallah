import { memo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import AvatarBadge from './AvatarBadge';
import { workerReviews } from '../data/appData';

function StarRating({ rating, size = 'sm' }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className={`flex items-center gap-0.5 ${size === 'lg' ? 'text-lg' : 'text-sm'}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < full ? 'text-amber-400' : half && i === full ? 'text-amber-300' : 'text-slate-200'}>
          ★
        </span>
      ))}
    </span>
  );
}

function WorkerDetailModal({ worker, onClose, onHire }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppContext();

  if (!worker) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`${worker.name} profile`}
    >
      <div className="modal-panel">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <AvatarBadge seed={worker.imageSeed || worker.name} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">{worker.category}</p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900 leading-tight">{worker.name}</h2>
            <div className="mt-1 flex items-center gap-2">
              <StarRating rating={worker.rating} />
              <span className="text-sm text-slate-500">{worker.rating} ({worker.reviewCount || 0} reviews)</span>
            </div>
            <p className="mt-1 text-sm text-slate-400">{worker.location} · {worker.distance}</p>
          </div>
        </div>

        {/* Availability */}
        <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${worker.available ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          <span className={`inline-block h-2 w-2 rounded-full ${worker.available ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          {worker.available ? 'Available Now' : 'Currently Busy'}
        </div>

        {/* Stats row */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: 'Experience', value: worker.experience || '—' },
            { label: 'Jobs Done', value: worker.completedJobs || '—' },
            { label: 'Starting', value: `${worker.price}/${worker.priceUnit || 'visit'}` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl bg-slate-50 p-3 text-center">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">{label}</p>
              <p className="mt-1 text-base font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Bio */}
        {worker.bio && (
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">About</p>
            <p className="text-sm leading-6 text-slate-600">{worker.bio}</p>
          </div>
        )}

        {/* Skills */}
        {worker.skills && worker.skills.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {worker.skills.map((skill) => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        {worker.phone && (
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Contact</p>
            <button 
              onClick={() => {
                if (!isAuthenticated) {
                  onClose();
                  navigate('/login');
                } else {
                  window.location.href = `tel:${worker.phone}`;
                }
              }}
              className="w-full flex items-center justify-between gap-3 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 hover:bg-slate-100 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">📞</span>
                <span className="text-sm font-semibold text-slate-700">
                  {isAuthenticated ? worker.phone : 'Unlock Phone Number'}
                </span>
              </div>
              {!isAuthenticated && <span className="text-slate-400">🔒</span>}
            </button>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Recent Reviews</p>
          <div className="space-y-3">
            {(workerReviews || []).slice(0, 3).map((review) => (
              <div key={review.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">{review.reviewer}</span>
                  <span className="text-xs text-slate-400">{review.date}</span>
                </div>
                <StarRating rating={review.rating} />
                <p className="mt-1 text-sm text-slate-600">{review.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => onHire(worker)}
          className="gradient-button mt-6 w-full text-base"
          id="hire-worker-btn"
        >
          Hire Now
        </button>
      </div>
    </div>,
    document.body
  );
}

export default memo(WorkerDetailModal);

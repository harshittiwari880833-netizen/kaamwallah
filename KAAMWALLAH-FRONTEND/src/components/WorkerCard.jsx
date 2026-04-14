import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarBadge from './AvatarBadge';
import WorkerDetailModal from './WorkerDetailModal';
import HireModal from './HireModal';
import { useAppContext } from '../context/AppContext';

function StarRating({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < Math.floor(rating) ? 'text-amber-400' : 'text-slate-200'} style={{ fontSize: '13px' }}>
          ★
        </span>
      ))}
    </span>
  );
}

function WorkerCard({ worker }) {
  const { t, isAuthenticated } = useAppContext();
  const navigate = useNavigate();
  const [showDetail, setShowDetail] = useState(false);
  const [showHire, setShowHire] = useState(false);

  return (
    <>
      <article className="group worker-card flex-shrink-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <AvatarBadge seed={worker.imageSeed || worker.name} />
              {worker.available !== undefined && (
                <span
                  className={`absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                    worker.available ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                />
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">
                {worker.category}
              </p>
              <h3 className="mt-0.5 text-lg font-extrabold text-slate-900 leading-tight">
                {worker.name}
              </h3>
              <p className="text-xs text-slate-400">{worker.location}</p>
            </div>
          </div>

          {/* Rating badge */}
          <div className="flex-shrink-0 rounded-2xl bg-amber-50 px-2.5 py-1.5 text-center">
            <p className="text-xs font-bold text-amber-600">⭐ {worker.rating}</p>
            <p className="text-[10px] text-slate-400">{worker.reviewCount} reviews</p>
          </div>
        </div>

        {/* Star row */}
        <div className="mt-3 flex items-center gap-2">
          <StarRating rating={worker.rating} />
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              worker.available
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {worker.available !== false ? t('available') : t('busy')}
          </span>
        </div>

        {/* Skills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(worker.skills || []).slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Price & Actions */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <div>
            <p className="text-[11px] text-slate-400">Starting</p>
            <p className="text-base font-bold text-slate-900">
              {worker.price}
              <span className="text-xs font-normal text-slate-400"> /{worker.priceUnit || 'visit'}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDetail(true); }}
              className="secondary-button px-3 py-2 text-xs"
              id={`view-worker-${worker.id}`}
            >
              {t('viewDetails')}
            </button>
            <button
              type="button"
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                if (!isAuthenticated) navigate('/login');
                else setShowHire(true); 
              }}
              className="gradient-button px-3 py-2 text-xs"
              id={`hire-worker-${worker.id}`}
            >
              {t('hireNow')}
            </button>
          </div>
        </div>
      </article>

      {showDetail && (
        <WorkerDetailModal
          worker={worker}
          onClose={() => setShowDetail(false)}
          onHire={(w) => { 
            setShowDetail(false); 
            if (!isAuthenticated) navigate('/login');
            else setShowHire(true); 
          }}
        />
      )}
      {showHire && (
        <HireModal
          worker={worker}
          onClose={() => setShowHire(false)}
          onSuccess={() => setShowHire(false)}
        />
      )}
    </>
  );
}

export default memo(WorkerCard);

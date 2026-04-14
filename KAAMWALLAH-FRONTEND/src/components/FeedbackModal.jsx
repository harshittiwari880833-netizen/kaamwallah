import { useState, memo } from 'react';
import { createPortal } from 'react-dom';

function StarRatingInteractive({ rating, setRating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          className={`text-4xl transition-transform hover:scale-110 ${
            star <= rating ? 'text-amber-400' : 'text-slate-200'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function FeedbackModal({ job, onSubmit, onClose }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!job) return null;

  return createPortal(
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-panel max-w-sm w-full animate-scale-in">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 shadow-sm mb-4">
            <span className="text-3xl text-emerald-600">🎉</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Job Completed!</h2>
          <p className="mt-2 text-sm text-slate-500">
            How was your experience with <b>{job.assignedWorkerId || 'the worker'}</b> for the job <b>{job.title}</b>?
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4">
          <StarRatingInteractive rating={rating} setRating={setRating} />
          
          <textarea
            className="form-input w-full resize-none bg-slate-50 mt-2"
            rows={3}
            placeholder="Share your experience (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onSubmit({ rating, comment })}
            className="w-full gradient-button py-3 text-sm"
          >
            Submit Feedback
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full ghost-button py-2 text-sm text-slate-500"
          >
            Remind me later
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default memo(FeedbackModal);

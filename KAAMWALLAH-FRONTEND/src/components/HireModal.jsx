import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import { createJob } from '../services/jobs';

const CATEGORIES = ['Plumber', 'Electrician', 'Carpenter', 'Painter', 'Cleaner', 'AC Technician'];
const DURATION_UNITS = ['Hours', 'Days'];

const initialForm = {
  title: '',
  category: 'Plumber',
  jobDescription: '',
  budget: '',
  durationValue: '',
  durationUnit: 'Hours',
  address: '',
  dateTime: '',
  notes: '',
};

export default function HireModal({ worker, onClose, onSuccess }) {
  const { t, addNotification, user } = useAppContext();
  const [addresses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kaam_wallah_addresses') || '[]'); } 
    catch { return []; }
  });
  const [useSavedAddress, setUseSavedAddress] = useState(addresses.length > 0);
  const [form, setForm] = useState({
    ...initialForm,
    title: worker ? `Hire ${worker.name} — ${worker.category}` : '',
    category: worker?.category || 'Plumber',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function validate() {
    const errs = {};
    if (form.jobDescription.trim().length < 10)
      errs.jobDescription = 'Describe the work (min 10 chars)';
    if (!form.budget.trim()) errs.budget = 'Budget is required';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.dateTime) errs.dateTime = 'Select a date and time';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await createJob({
        title: form.title || `${form.category} job`,
        category: form.category,
        description: form.jobDescription,
        budget: form.budget,
        duration: `${form.durationValue} ${form.durationUnit}`,
        location: useSavedAddress ? addresses.find(a => a.label === form.address)?.text || form.address : form.address,
        scheduledAt: form.dateTime,
        notes: form.notes,
        workerId: worker?.id,
        postedBy: user?.name || 'Client',
        clientPhone: user?.phone,
      });
      addNotification({
        type: 'hire_request',
        title: t('jobRequestSent'),
        message: t('jobRequestSuccess'),
      });
      setSubmitted(true);
    } catch {
      // fallback: save locally
      try {
        const stored = JSON.parse(localStorage.getItem('kaam_wallah_posted_jobs') || '[]');
        localStorage.setItem(
          'kaam_wallah_posted_jobs',
          JSON.stringify([
            {
              id: Date.now(),
              title: form.title || `${form.category} job`,
              category: form.category,
              description: form.jobDescription,
              budget: form.budget,
              location: useSavedAddress ? addresses.find(a => a.label === form.address)?.text || form.address : form.address,
              status: 'Pending',
              postedBy: user?.name || 'Client',
              clientPhone: user?.phone,
            },
            ...stored,
          ])
        );
      } catch {/* ignore */}
      addNotification({
        type: 'hire_request',
        title: t('jobRequestSent'),
        message: t('jobRequestSuccess'),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (!worker) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Hire worker"
    >
      <div className="modal-panel">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          aria-label="Close"
        >
          ✕
        </button>

        {submitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-4xl">
              ✅
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-slate-900">{t('jobRequestSent')}</h2>
            <p className="mt-2 text-sm text-slate-500">{t('jobRequestSuccess')}</p>
            <button
              type="button"
              onClick={() => { onSuccess?.(); onClose(); }}
              className="gradient-button mt-6 w-full"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">{t('hireWorker')}</p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-900">{worker.name}</h2>
              <p className="text-sm text-slate-400">{worker.category} · {worker.location}</p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              {/* Category */}
              <div>
                <label className="form-label">{t('category')}</label>
                <select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className="form-input"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Job Description */}
              <div>
                <label className="form-label">{t('jobDescription')}</label>
                <textarea
                  rows={3}
                  value={form.jobDescription}
                  onChange={(e) => set('jobDescription', e.target.value)}
                  className="form-input"
                  placeholder={t('descriptionPlaceholder')}
                />
                {errors.jobDescription && <p className="form-error">{errors.jobDescription}</p>}
              </div>

              {/* Budget */}
              <div>
                <label className="form-label">{t('budget')}</label>
                <input
                  type="text"
                  value={form.budget}
                  onChange={(e) => set('budget', e.target.value)}
                  className="form-input"
                  placeholder={t('budgetPlaceholder')}
                />
                {errors.budget && <p className="form-error">{errors.budget}</p>}
              </div>

              {/* Duration */}
              <div>
                <label className="form-label">{t('duration')}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={form.durationValue}
                    onChange={(e) => set('durationValue', e.target.value)}
                    className="form-input"
                    placeholder="2"
                  />
                  <select
                    value={form.durationUnit}
                    onChange={(e) => set('durationUnit', e.target.value)}
                    className="form-input w-32"
                  >
                    {DURATION_UNITS.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="form-label mb-2 flex items-center justify-between">
                  {t('address')}
                  {addresses.length > 0 && (
                    <button 
                      type="button" 
                      onClick={() => setUseSavedAddress(!useSavedAddress)} 
                      className="text-xs text-cyan-600 font-bold"
                    >
                      {useSavedAddress ? '+ New Address' : 'Use Saved'}
                    </button>
                  )}
                </label>

                {useSavedAddress && addresses.length > 0 ? (
                  <select 
                    value={form.address} 
                    onChange={(e) => set('address', e.target.value)} 
                    className="form-input"
                  >
                    <option value="">Select an address</option>
                    {addresses.map(a => <option key={a.id} value={a.label}>{a.label} - {a.text}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                    className="form-input"
                    placeholder={t('locationPlaceholder')}
                  />
                )}
                {errors.address && <p className="form-error">{errors.address}</p>}
              </div>

              {/* Date & Time */}
              <div>
                <label className="form-label">{t('dateTime')}</label>
                <input
                  type="datetime-local"
                  value={form.dateTime}
                  onChange={(e) => set('dateTime', e.target.value)}
                  className="form-input"
                />
                {errors.dateTime && <p className="form-error">{errors.dateTime}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className="form-label">{t('notes')}</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  className="form-input"
                  placeholder={t('notesPlaceholder')}
                />
              </div>

              <button
                type="submit"
                className="gradient-button w-full mt-2"
                disabled={loading}
              >
                {loading ? 'Submitting...' : t('submitRequest')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

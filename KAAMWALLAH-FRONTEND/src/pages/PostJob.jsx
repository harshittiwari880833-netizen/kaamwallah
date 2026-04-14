import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useAppContext } from '../context/AppContext';
import { createJob } from '../services/jobs';

const CATEGORIES = ['Plumber', 'Electrician', 'Carpenter', 'Painter', 'Cleaner', 'AC Technician'];
const DURATION_UNITS = ['Hours', 'Days', 'Weeks'];

const initialState = {
  title: '',
  category: 'Plumber',
  budget: '',
  location: '',
  description: '',
  durationValue: '',
  durationUnit: 'Hours',
  dateTime: '',
  notes: '',
};

export default function PostJob() {
  const navigate = useNavigate();
  const { t, addNotification, isAuthenticated, user } = useAppContext();
  const [addresses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kaam_wallah_addresses') || '[]'); } 
    catch { return []; }
  });
  const [useSavedAddress, setUseSavedAddress] = useState(addresses.length > 0);
  const [isUrgent, setIsUrgent] = useState(false);
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function validate() {
    const errs = {};
    if (form.title.trim().length < 5) errs.title = 'Enter a clear job title (min 5 chars)';
    if (!form.budget.trim()) errs.budget = 'Budget is required';
    if (form.location.trim().length < 3) errs.location = 'Enter a valid address';
    if (form.description.trim().length < 20) errs.description = 'Description must be at least 20 characters';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const jobData = {
      title: form.title,
      category: form.category,
      budget: form.budget,
      description: form.description,
      duration: form.durationValue ? `${form.durationValue} ${form.durationUnit}` : undefined,
      location: useSavedAddress ? addresses.find(a => a.label === form.location)?.text || form.location : form.location,
      urgency: isUrgent ? 'Urgent' : 'Flexible',
      scheduledAt: form.dateTime || undefined,
      notes: form.notes || undefined,
      postedBy: user?.name || 'Client',
      clientPhone: user?.phone,
    };

    try {
      if (isAuthenticated) {
        await createJob(jobData);
      } else {
        throw new Error('Not authenticated');
      }
    } catch {
      // Fallback: save locally
      try {
        const stored = JSON.parse(localStorage.getItem('kaam_wallah_posted_jobs') || '[]');
        localStorage.setItem('kaam_wallah_posted_jobs', JSON.stringify([
          { ...jobData, id: Date.now(), status: 'Pending' },
          ...stored,
        ]));
      } catch { /* ignore */ }
    } finally {
      setLoading(false);
    }

    addNotification({
      type: 'new_job',
      title: t('jobPosted'),
      message: t('jobLive'),
    });
    setSubmitted(true);
    setForm(initialState);
  }

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        eyebrow={t('postNewJob')}
        title={t('tellWorkers')}
        description="Describe your work clearly so nearby workers can respond fast."
      />

      <section className="surface-card p-6 sm:p-8">
        {/* Success state */}
        {submitted && (
          <div className="mb-6 rounded-[2rem] bg-emerald-50 p-6 text-emerald-800 animate-scale-in">
            <p className="font-bold text-2xl">✅ {t('jobPosted')}</p>
            <p className="mt-2 text-sm leading-6">{t('jobLive')}</p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="secondary-button text-sm px-4 py-2"
              >
                Post Another Job
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="gradient-button text-sm px-4 py-2"
              >
                Go to Dashboard →
              </button>
            </div>
          </div>
        )}

        <form className="grid gap-5" onSubmit={handleSubmit}>
          {/* Job Title */}
          <div>
            <label className="form-label">{t('jobTitle')}</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className="form-input"
              placeholder={t('jobTitlePlaceholder')}
              id="job-title"
            />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>

          {/* Category + Budget + Duration */}
          <div className="grid gap-4 sm:grid-cols-3">
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
                  className="form-input w-28"
                >
                  {DURATION_UNITS.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
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
                 value={form.location} 
                 onChange={(e) => set('location', e.target.value)} 
                 className="form-input"
               >
                 <option value="">Select an address</option>
                 {addresses.map(a => <option key={a.id} value={a.label}>{a.label} - {a.text}</option>)}
               </select>
             ) : (
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                  className="form-input"
                  placeholder={t('locationPlaceholder')}
                />
             )}
            {errors.location && <p className="form-error">{errors.location}</p>}
          </div>

          <div className="flex items-center gap-3 bg-rose-50 border-2 border-rose-100 rounded-2xl p-4 cursor-pointer" onClick={() => setIsUrgent(!isUrgent)}>
             <input type="checkbox" checked={isUrgent} onChange={() => {}} className="w-5 h-5 rounded border-rose-300 text-rose-500 focus:ring-rose-500" />
             <div>
                <p className="font-bold text-rose-700">Mark as Urgent 🔥</p>
                <p className="text-xs text-rose-500">Show this at the top of nearby worker feeds</p>
             </div>
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
          </div>

          {/* Description */}
          <div>
            <label className="form-label">{t('jobDescription')}</label>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className="form-input"
              placeholder={t('descriptionPlaceholder')}
            />
            {errors.description && <p className="form-error">{errors.description}</p>}
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

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              className="gradient-button sm:w-auto w-full"
              disabled={loading}
              id="submit-job-btn"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin-slow" />
                  Posting…
                </span>
              ) : t('submitJob')}
            </button>
            <button
              type="button"
              onClick={() => { setForm(initialState); setErrors({}); }}
              className="secondary-button sm:w-auto w-full"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import JobCard from '../components/JobCard';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import { SkeletonBlock } from '../components/LoadingSkeleton';
import JobDetailModal from '../components/JobDetailModal';
import { availableJobs } from '../data/appData';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';
import { updateJobStatus } from '../services/jobs';

const CATEGORIES = ['All', 'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Cleaner', 'AC Technician'];
const URGENCIES = ['All', 'Urgent', 'Today', 'Flexible'];

function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
        active
          ? 'bg-cyan-500 text-white shadow-md shadow-cyan-200'
          : 'bg-white text-slate-600 border border-slate-200 hover:border-cyan-300 hover:text-cyan-700'
      }`}
    >
      {label}
    </button>
  );
}

function JobSkeleton() {
  return (
    <div className="surface-card p-5 space-y-3">
      <div className="flex gap-2"><SkeletonBlock className="h-5 w-20 rounded-full" /><SkeletonBlock className="h-5 w-16 rounded-full" /></div>
      <SkeletonBlock className="h-7 w-3/4" />
      <SkeletonBlock className="h-4 w-full" />
      <div className="flex justify-between pt-2">
        <SkeletonBlock className="h-10 w-28" />
        <SkeletonBlock className="h-10 w-24" />
      </div>
    </div>
  );
}

export default function Jobs() {
  const { role, t, user, addNotification } = useAppContext();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [locationQuery, setLocationQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(location.state?.category || 'All');
  const [activeUrgency, setActiveUrgency] = useState('All');

  // Try API first, fallback to mock
  useEffect(() => {
    let cancelled = false;
    async function fetchJobs() {
      try {
        const res = await api.get('/workers/search'); // workers endpoint returns available jobs too
        const data = res.data?.data || [];
        const localJobs = JSON.parse(localStorage.getItem('kaam_wallah_posted_jobs') || '[]');
        if (!cancelled) {
          setJobs([...localJobs, ...(data.length ? data : availableJobs)]);
        }
      } catch {
        const localJobs = JSON.parse(localStorage.getItem('kaam_wallah_posted_jobs') || '[]');
        if (!cancelled) setJobs([...localJobs, ...availableJobs]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    const timer = setTimeout(fetchJobs, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesCat = activeCategory === 'All' || job.category === activeCategory;
      const matchesUrgency = activeUrgency === 'All' || job.urgency === activeUrgency;
      const matchesLoc = !locationQuery.trim()
        || (job.location || '').toLowerCase().includes(locationQuery.toLowerCase());
      return matchesCat && matchesUrgency && matchesLoc;
    });
  }, [jobs, activeCategory, activeUrgency, locationQuery]);

  const fetchJobsData = useCallback(async () => {
    try {
      const res = await api.get('/workers/search', { showError: false });
      const data = res.data?.data || [];
      const localJobs = JSON.parse(localStorage.getItem('kaam_wallah_posted_jobs') || '[]');
      setJobs([...localJobs, ...(data.length ? data : availableJobs)]);
    } catch {
      const localJobs = JSON.parse(localStorage.getItem('kaam_wallah_posted_jobs') || '[]');
      setJobs([...localJobs, ...availableJobs]);
    }
  }, []);

  async function handleAccept(job) {
    try {
      await updateJobStatus(job.id, 'Accepted', user?.id || 'worker-1');
      addNotification({ type: 'job_accepted', title: 'Job Accepted', message: `You accepted ${job.title}.` });
      fetchJobsData();
    } catch {}
  }
  function handleReject(job) {
    setSelectedJob(null);
  }

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        eyebrow={t('availableJobs')}
        title={t('browseNearby')}
        description={role === 'worker' ? 'Find nearby jobs and apply now.' : 'Browse all posted jobs in your area.'}
      />

      {/* Filter bar */}
      <section className="surface-card p-5">
        {/* Category chips */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('category')}</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hidden">
            {CATEGORIES.map((cat) => (
              <FilterChip
                key={cat}
                label={cat === 'All' ? t('all') : cat}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Urgency chips */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Urgency</p>
            <div className="flex flex-wrap gap-2">
              {URGENCIES.map((u) => (
                <FilterChip
                  key={u}
                  label={u === 'All' ? t('all') : t(u.toLowerCase()) || u}
                  active={activeUrgency === u}
                  onClick={() => setActiveUrgency(u)}
                />
              ))}
            </div>
          </div>

          {/* Location search */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('location')}</p>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 transition focus-within:border-cyan-300">
              <span className="text-slate-400 text-sm">📍</span>
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Search locality or city…"
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-slate-400 px-1">
          {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
          {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
        </p>
      )}

      {/* Job list */}
      <section className="grid gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <JobSkeleton key={i} />)
          : filteredJobs.length
          ? filteredJobs.map((job) => (
               <JobCard
                 key={job.id}
                 job={job}
                 onAction={(j) => setSelectedJob(j)}
               />
            ))
          : (
            <EmptyState
              title={t('noJobsFound')}
              description={t('tryWideningFilters')}
            />
          )}
      </section>

      {selectedJob && (
         <JobDetailModal 
            job={selectedJob} 
            onClose={() => setSelectedJob(null)}
            onAccept={handleAccept}
            onReject={handleReject}
         />
      )}
    </div>
  );
}

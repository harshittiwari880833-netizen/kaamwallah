import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import WorkerCard from '../components/WorkerCard';
import JobCard from '../components/JobCard';
import JobDetailModal from '../components/JobDetailModal';
import ActiveJobPanel from '../components/ActiveJobPanel';
import { WorkerCardSkeleton } from '../components/LoadingSkeleton';
import PageHeader from '../components/PageHeader';
import { serviceCategories, featuredWorkers, availableJobs } from '../data/appData';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';
import { updateJobStatus } from '../services/jobs';

const SEARCH_PLACEHOLDERS = [
  'Search plumber, electrician…',
  'Find a painter near you…',
  'Hire a carpenter today…',
  'AC technician available now…',
  'Expert cleaner at your door…',
];

const STATS = [
  { value: '2,500+', labelKey: 'verifiedWorkers', icon: '👷' },
  { value: '12 min', labelKey: 'avgResponse', icon: '⚡' },
  { value: '4.8/5', labelKey: 'customerRating', icon: '⭐' },
  { value: '24×7', labelKey: 'support24x7', icon: '🛡️' },
];

function ClientHome() {
  const { t } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % SEARCH_PLACEHOLDERS.length);
    }, 2500);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchWorkers() {
      try {
        // use silent background fetch
        const res = await api.get('/workers/search', { showError: false });
        const data = res.data?.data || [];
        if (!cancelled) setWorkers(data.length ? data : featuredWorkers);
      } catch {
        if (!cancelled) setWorkers(featuredWorkers);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchWorkers();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-10 page-enter">
      {/* ── HERO ── */}
      <section className="surface-card relative overflow-hidden px-6 py-10 sm:px-10 sm:py-14">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-cyan-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-sky-200/30 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 top-1/2 h-32 w-32 rounded-full bg-purple-100/30 blur-3xl pointer-events-none" />

        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-cyan-700">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-cyan-500" />
              India's trusted labour marketplace
            </span>

            <div>
              <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-5xl leading-[1.1]">
                {t('findTrustedWorkers')}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
                {t('heroSubtitle')}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-[1.75rem] bg-white px-4 py-3 shadow-soft border border-slate-100 transition focus-within:border-cyan-300 focus-within:shadow-[0_0_0_4px_rgba(34,211,238,0.1)]">
                <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0 text-cyan-500 fill-none stroke-current stroke-2">
                  <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={SEARCH_PLACEHOLDERS[placeholderIdx]}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 transition-all"
                  id="home-search"
                />
              </div>
              <Link to="/post-job" className="gradient-button whitespace-nowrap">
                {t('postAJob')}
              </Link>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/jobs" className="secondary-button text-sm px-5 py-2.5">
                {t('findWorkers')}
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_32px_80px_-20px_rgba(8,145,178,0.35)] animate-float">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-4">Live Platform Stats</p>
            <div className="grid grid-cols-2 gap-3">
              {STATS.map((stat) => (
                <div key={stat.labelKey} className="rounded-[1.5rem] bg-white/8 border border-white/10 p-4">
                  <p className="text-2xl">{stat.icon}</p>
                  <p className="mt-2 text-2xl font-extrabold">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{t(stat.labelKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="space-y-5">
        <PageHeader eyebrow={t('popularServices')} title={t('bookTopCategories')} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {serviceCategories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* ── WORKER CAROUSEL ── */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <PageHeader eyebrow={t('featuredPros')} title={t('topWorkers')} />
          <Link to="/jobs" className="hidden sm:inline-flex secondary-button text-sm px-4 py-2">
            View All →
          </Link>
        </div>
        <div className="scroll-container mask-fade-right">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <WorkerCardSkeleton key={i} />)
            : workers.map((worker) => <WorkerCard key={worker.id} worker={worker} />)}
        </div>
      </section>
    </div>
  );
}

function WorkerHome() {
  const { t, user, addNotification } = useAppContext();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchJobsData = useCallback(async () => {
    try {
      const res = await api.get('/workers/search', { showError: false }); 
      const data = res.data?.data || [];
      const localJobs = JSON.parse(localStorage.getItem('kaam_wallah_posted_jobs') || '[]');
      setJobs([...localJobs, ...(data.length ? data : availableJobs)]);
    } catch {
      const localJobs = JSON.parse(localStorage.getItem('kaam_wallah_posted_jobs') || '[]');
      setJobs([...localJobs, ...availableJobs]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobsData();
  }, [fetchJobsData]);

  const handleAccept = async (job) => {
    try {
      await updateJobStatus(job.id, 'Accepted', user?.id || 'worker-1');
      addNotification({ type: 'job_accepted', title: 'Job Accepted', message: `You accepted ${job.title}.` });
      fetchJobsData();
    } catch {}
  };

  const handleReject = async (job) => {
    setSelectedJob(null);
  };

  const activeJob = jobs.find(j => j.status === 'Accepted' && (j.assignedWorkerId === user?.id || j.assignedWorkerId === 'worker-1'));
  const urgentJobs = jobs.filter(j => (!j.status || j.status === 'Pending') && (j.urgency === 'Urgent' || j.urgency === 'Today'));
  const otherJobs = jobs.filter(j => (!j.status || j.status === 'Pending') && j.urgency !== 'Urgent' && j.urgency !== 'Today');

  return (
    <div className="space-y-8 page-enter">
      {/* Worker Hero Summary */}
      <section className="surface-card flex flex-col md:flex-row items-center justify-between gap-6 px-6 py-8 sm:px-10 bg-gradient-to-r from-sky-50 to-indigo-50 border-white/80">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700 mb-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Market
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">Find Jobs Near You</h1>
          <p className="mt-2 text-slate-600 max-w-md">Browse urgent requests and nearby opportunities. Apply instantly to secure work.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white rounded-[1.5rem] p-4 shadow-sm text-center min-w-[120px]">
            <p className="text-3xl font-black text-indigo-600">{jobs.length}</p>
            <p className="text-xs font-bold text-slate-400 uppercase mt-1">Total Jobs</p>
          </div>
          <div className="bg-white rounded-[1.5rem] p-4 shadow-sm text-center min-w-[120px]">
            <p className="text-3xl font-black text-rose-500">{urgentJobs.length}</p>
            <p className="text-xs font-bold text-slate-400 uppercase mt-1">Urgent</p>
          </div>
        </div>
      </section>

      {/* Active Job Prominent View */}
      {activeJob && (
        <ActiveJobPanel job={activeJob} onStatusChange={() => fetchJobsData()} />
      )}

      {/* Urgent Jobs Carousel */}
      {!activeJob && urgentJobs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <span className="text-xl">🔥</span>
            <h2 className="text-xl font-extrabold text-slate-900">Urgent Requirements</h2>
          </div>
          <div className="scroll-container mask-fade-right pb-6">
            {urgentJobs.map(job => (
              <div key={job.id} className="min-w-[300px] max-w-[340px]">
                <JobCard job={job} onAction={(j) => setSelectedJob(j)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Map/Filter bar mock */}
      <section className="flex flex-col sm:flex-row gap-3 items-center justify-between px-2">
        <h2 className="text-xl font-extrabold text-slate-900">All Available Jobs</h2>
        <div className="flex items-center gap-2">
          <select className="form-input py-2 text-sm bg-slate-50 border-slate-100 rounded-xl min-w-[140px]">
            <option>Any Location</option>
            <option>Within 5 km</option>
            <option>Within 15 km</option>
          </select>
          <button className="icon-button bg-white shadow-soft text-slate-700">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </section>

      {/* standard job list */}
      <section className="grid gap-4 md:grid-cols-2">
        {loading ? (
           Array.from({ length: 4 }).map((_, i) => (
             <div key={i} className="surface-card p-5 space-y-3">
              <WorkerCardSkeleton />
             </div>
           ))
        ) : otherJobs.map((job) => (
          <JobCard key={job.id} job={job} onAction={(j) => setSelectedJob(j)} />
        ))}
        {!loading && otherJobs.length === 0 && (
          <div className="col-span-full">
            <div className="surface-card p-8 flex flex-col items-center justify-center text-center">
              <span className="text-4xl mb-3">🔍</span>
              <h3 className="text-lg font-bold text-slate-800">No other jobs found</h3>
              <p className="text-slate-500 text-sm mt-1">Try expanding your location radius.</p>
            </div>
          </div>
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

export default function Home() {
  const { role } = useAppContext();
  
  if (role === 'worker') {
    return <WorkerHome />;
  }
  
  return <ClientHome />;
}


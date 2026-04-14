import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AvatarBadge from '../components/AvatarBadge';
import JobCard from '../components/JobCard';
import JobDetailModal from '../components/JobDetailModal';
import WorkerCard from '../components/WorkerCard';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import { SkeletonBlock } from '../components/LoadingSkeleton';
import { activeDashboardJobs, completedDashboardJobs, dashboardStats, featuredWorkers } from '../data/appData';
import { useAppContext } from '../context/AppContext';
import { getMyJobs, updateJobStatus } from '../services/jobs';
import FeedbackModal from '../components/FeedbackModal';

function StatCard({ icon, label, value, delta }) {
  return (
    <article className="stat-card hover:-translate-y-1 transition-transform duration-200">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {delta && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">{delta}</span>}
      </div>
      <p className="mt-3 text-3xl font-extrabold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </article>
  );
}

function JobSkeleton() {
  return (
    <div className="surface-card p-5 space-y-3">
      <SkeletonBlock className="h-5 w-24" />
      <SkeletonBlock className="h-7 w-2/3" />
      <SkeletonBlock className="h-4 w-full" />
      <div className="flex justify-between pt-2">
        <SkeletonBlock className="h-10 w-28" />
        <SkeletonBlock className="h-10 w-24" />
      </div>
    </div>
  );
}

function WorkerDashboard({ user, t, primaryJobs, jobsLoading, handleAccept, handleReject, setSelectedJob }) {
  return (
    <div className="space-y-8 page-enter">
      <PageHeader eyebrow={t('myDashboard')} title={t('trackEarnings')} />

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="surface-card overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600" />
          <div className="px-6 pb-6 -mt-10">
            <AvatarBadge seed={user?.name || user?.email || 'KW'} size="lg" imgSrc={user?.profilePic} />
            <div className="mt-3">
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">{t('workerProfileLabel')}</p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">{user?.name || 'Kaam User'}</h2>
              <p className="mt-0.5 text-sm text-slate-400">{user?.email || user?.phone || 'Phone verified account'}</p>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-400">{t('currentRole')}</p>
              <p className="mt-1 text-base font-bold text-slate-800">💼 {t('findingWork')}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 content-start">
          {dashboardStats.map((stat) => (
            <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} delta={stat.delta} />
          ))}
          <div className="surface-card p-5 sm:col-span-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">{t('earnings')} (This Month)</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">₹18,450</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">↑ +22% vs last month</p>
            </div>
            <div className="text-5xl">💰</div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-title text-2xl">{t('activeJobs')}</h2>
        {jobsLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 2 }).map((_, i) => <JobSkeleton key={i} />)}
          </div>
        ) : primaryJobs.length ? (
          <div className="grid gap-4">
            {primaryJobs.map((job) => (
              <JobCard
                key={job.id}
                job={{
                  ...job,
                  urgency: job.urgency || job.status,
                  postedBy: job.postedBy || user?.name || 'You',
                  description: job.description || 'This job is part of your current workflow.',
                }}
                actionLabel={['Accepted', 'In progress'].includes(job.status) ? '📍 View Map' : t('openJob')}
                showActions={job.status === 'Pending'}
                onAccept={handleAccept}
                onReject={handleReject}
                onAction={(j) => {
                  if (['Accepted', 'In progress'].includes(j.status)) {
                    window.open(`https://maps.google.com/?q=${encodeURIComponent(j.location)}`, '_blank');
                  } else {
                    setSelectedJob(j);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState title={t('noActiveJobs')} description={t('postFirstJob')} />
        )}
      </section>

      <section className="space-y-4">
        <h2 className="section-title text-2xl">Jobs Near You</h2>
        <div className="scroll-container">
          {featuredWorkers.slice(0, 3).map((w, i) => (
            <div key={i} className="flex-shrink-0 min-w-[300px] surface-card p-5 space-y-3">
              <span className="badge-blue">{w.category}</span>
              <h3 className="font-extrabold text-slate-900">{w.name} needs help</h3>
              <p className="text-sm text-slate-500">Budget: {w.price}</p>
              <p className="text-xs text-slate-400">📍 {w.location}</p>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 rounded-xl bg-emerald-500 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition">Accept</button>
                <button className="flex-1 rounded-xl bg-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-300 transition">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-title text-2xl">{t('completedJobs')}</h2>
        <div className="grid gap-4">
          {completedDashboardJobs.map((job) => (
            <JobCard key={job.id} job={{ ...job, urgency: job.status, postedBy: job.postedBy || 'Kaam Wallah' }} actionLabel={t('viewSummary')} onAction={(j) => setSelectedJob(j)} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ClientDashboard({ user, t, primaryJobs, postedJobs, jobsLoading, setSelectedJob }) {
  return (
    <div className="space-y-8 page-enter">
      <PageHeader eyebrow={t('myDashboard')} title={t('manageBookings')} />

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="surface-card overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600" />
          <div className="px-6 pb-6 -mt-10">
            <AvatarBadge seed={user?.name || user?.email || 'KW'} size="lg" imgSrc={user?.profilePic} />
            <div className="mt-3">
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">{t('customerProfile')}</p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">{user?.name || 'Kaam User'}</h2>
              <p className="mt-0.5 text-sm text-slate-400">{user?.email || user?.phone || 'Phone verified account'}</p>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-400">{t('currentRole')}</p>
              <p className="mt-1 text-base font-bold text-slate-800">🏠 {t('hiringCustomers')}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 content-start">
          <StatCard icon="📋" label="Jobs Posted" value={postedJobs.length} />
          <StatCard icon="⚡" label="Active Jobs" value={primaryJobs.length} />
          <StatCard icon="👷" label="Workers Hired" value={completedDashboardJobs.length} />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link to="/jobs" className="surface-card flex flex-col items-start gap-3 p-6 transition hover:-translate-y-1 hover:shadow-md">
          <span className="text-3xl">🔍</span>
          <h3 className="text-lg font-extrabold text-slate-900">{t('findWorkers')}</h3>
          <p className="text-sm text-slate-500">Browse verified workers near you and hire instantly.</p>
          <span className="gradient-button text-sm px-4 py-2 mt-1">Browse Workers →</span>
        </Link>
        <Link to="/post-job" className="surface-card flex flex-col items-start gap-3 p-6 transition hover:-translate-y-1 hover:shadow-md">
          <span className="text-3xl">📋</span>
          <h3 className="text-lg font-extrabold text-slate-900">{t('postJob')}</h3>
          <p className="text-sm text-slate-500">Describe your work and get quotes from skilled workers.</p>
          <span className="gradient-button text-sm px-4 py-2 mt-1">Post a Job →</span>
        </Link>
      </section>

      <section className="space-y-4">
        <h2 className="section-title text-2xl">Active & Posted Jobs</h2>
        {jobsLoading ? (
          <div className="grid gap-4">
             {Array.from({ length: 2 }).map((_, i) => <JobSkeleton key={i} />)}
          </div>
        ) : primaryJobs.length ? (
          <div className="grid gap-4">
             {primaryJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={{
                    ...job,
                    urgency: job.urgency || job.status,
                    postedBy: job.postedBy || user?.name || 'You',
                  }}
                  actionLabel={t('trackRequest')}
                  onAction={() => setSelectedJob(job)}
                />
             ))}
          </div>
        ) : (
          <EmptyState title={t('noActiveJobs')} description={t('postFirstJob')} />
        )}
      </section>

      <section className="space-y-4">
        <h2 className="section-title text-2xl">Recently Hired Workers</h2>
        <div className="scroll-container">
          {featuredWorkers.slice(0, 3).map((w, i) => (
            <WorkerCard key={w.id} worker={w} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default function Dashboard() {
  const { role, user, t } = useAppContext();
  const [apiJobs, setApiJobs] = useState(null);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  const [postedJobs, setPostedJobs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('kaam_wallah_posted_jobs') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleJobsUpdated = () => {
      setPostedJobs(JSON.parse(localStorage.getItem('kaam_wallah_posted_jobs') || '[]'));
    };
    window.addEventListener('jobs_updated', handleJobsUpdated);
    return () => window.removeEventListener('jobs_updated', handleJobsUpdated);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchJobs() {
      try {
        const res = await getMyJobs();
        if (!cancelled) setApiJobs(res?.data || []);
      } catch {
        if (!cancelled) setApiJobs(null);
      } finally {
        if (!cancelled) setJobsLoading(false);
      }
    }
    fetchJobs();
    return () => { cancelled = true; };
  }, []);

  const primaryJobs = (apiJobs !== null && apiJobs.length > 0
    ? apiJobs
    : role !== 'worker'
    ? [...postedJobs, ...activeDashboardJobs]
    : activeDashboardJobs).filter(j => j.status !== 'Completed' && j.status !== 'completed');

  const dynCompletedJobs = postedJobs.filter(j => j.status === 'Completed' || j.status === 'completed');
  const allCompletedDashboardJobs = [...dynCompletedJobs, ...completedDashboardJobs];

  async function handleAccept(job) {
    try { await updateJobStatus(job.id, 'Accepted'); } catch { /* ignore */ }
  }
  async function handleReject(job) {
    try { await updateJobStatus(job.id, 'Rejected'); } catch { /* ignore */ }
  }
  async function handleComplete(job) {
    try { await updateJobStatus(job.id, 'Completed'); } catch { /* ignore */ }
  }
  async function handleFeedbackSubmit(feedback, pendingJob) {
    try {
      const db = JSON.parse(localStorage.getItem('kaam_wallah_posted_jobs') || '[]');
      const idx = db.findIndex(j => j.id === pendingJob.id);
      if(idx !== -1) {
        db[idx].feedbackPending = false;
        db[idx].rating = feedback.rating;
        db[idx].review = feedback.comment;
        localStorage.setItem('kaam_wallah_posted_jobs', JSON.stringify(db));
        window.dispatchEvent(new Event('jobs_updated'));
      }
    } catch { /* ignore */ }
  }

  const pendingFeedbackJob = postedJobs.find(j => j.feedbackPending);

  if (role !== 'worker') {
    return (
      <>
        <ClientDashboard 
          user={user} 
          t={t} 
          primaryJobs={primaryJobs} 
          postedJobs={postedJobs}
          jobsLoading={jobsLoading}
          setSelectedJob={setSelectedJob} 
        />
        {selectedJob && (
          <JobDetailModal 
            job={selectedJob} 
            onClose={() => setSelectedJob(null)}
          />
        )}
        {pendingFeedbackJob && (
          <FeedbackModal
            job={pendingFeedbackJob}
            onClose={() => handleFeedbackSubmit({ rating: 5, comment: '' }, pendingFeedbackJob)}
            onSubmit={(feedback) => handleFeedbackSubmit(feedback, pendingFeedbackJob)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <WorkerDashboard 
        user={user} 
        t={t} 
        primaryJobs={primaryJobs} 
        jobsLoading={jobsLoading} 
        handleAccept={handleAccept} 
        handleReject={handleReject}
        setSelectedJob={setSelectedJob} 
      />
      {selectedJob && (
        <JobDetailModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)}
          onAccept={handleAccept}
          onReject={handleReject}
          onComplete={handleComplete}
        />
      )}
    </>
  );
}

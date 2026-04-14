import { trackingSteps } from '../data/appData';
import PageHeader from '../components/PageHeader';
import { useAppContext } from '../context/AppContext';

const ACTIVE_STEP = 2; // "In Progress"

export default function Tracking() {
  const { t } = useAppContext();

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        eyebrow={t('trackYourJob')}
        title={t('jobStatus')}
        description="A real-time view of your active booking progress."
      />

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Main tracker */}
        <div className="space-y-6">
          {/* Step stepper */}
          <div className="surface-card p-6">
            <h2 className="section-title text-2xl mb-6">Live Progress</h2>
            <div className="relative">
              {/* Progress line */}
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-100" />
              <div
                className="absolute left-6 top-6 w-0.5 bg-gradient-to-b from-cyan-500 to-sky-400 transition-all duration-700"
                style={{ height: `${(ACTIVE_STEP / (trackingSteps.length - 1)) * 100}%` }}
              />

              <div className="space-y-6 pl-14 relative">
                {trackingSteps.map((step, index) => {
                  const done = index <= ACTIVE_STEP;
                  const current = index === ACTIVE_STEP;
                  return (
                    <div key={step} className="relative">
                      {/* Dot */}
                      <div
                        className={`absolute -left-14 flex h-12 w-12 items-center justify-center rounded-2xl font-bold text-sm transition-all duration-300 ${
                          done
                            ? 'bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-md shadow-cyan-200'
                            : 'bg-slate-100 text-slate-400'
                        } ${current ? 'ring-4 ring-cyan-200 animate-pulse-soft' : ''}`}
                      >
                        {index < ACTIVE_STEP ? '✓' : index + 1}
                      </div>

                      <div className={`rounded-2xl p-4 transition ${done ? 'bg-cyan-50/60' : 'bg-slate-50'}`}>
                        <p className={`font-bold ${done ? 'text-slate-900' : 'text-slate-400'}`}>{step}</p>
                        <p className={`text-xs mt-0.5 ${done ? 'text-cyan-600 font-semibold' : 'text-slate-400'}`}>
                          {current ? '🔴 In progress right now' : done ? `✅ Completed` : 'Upcoming'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="rounded-[2rem] bg-slate-950 p-6 text-white relative overflow-hidden min-h-[200px]">
            <div className="absolute left-8 top-16 h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_0_8px_rgba(34,211,238,0.12)]" />
            <div className="absolute right-12 bottom-16 h-3 w-3 rounded-full bg-white/60 shadow-[0_0_0_8px_rgba(255,255,255,0.08)]" />
            <div className="absolute left-12 top-20 h-0.5 w-[60%] rotate-[15deg] bg-gradient-to-r from-cyan-300 to-white/20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(34,211,238,0.15),transparent_30%)]" />
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">On the Move</p>
              <h3 className="mt-3 text-2xl font-extrabold">Worker is 12 minutes away</h3>
              <p className="mt-2 text-sm text-slate-400 max-w-xs">
                Map integration coming soon. Real-time location tracking will appear here.
              </p>
            </div>
          </div>
        </div>

        {/* Booking summary */}
        <aside className="space-y-5">
          <div className="surface-card p-6">
            <h2 className="section-title text-2xl mb-4">Booking Summary</h2>
            <div className="space-y-3">
              {[
                ['🔧 Service', 'Kitchen sink repair'],
                ['👷 Worker', 'Aftab Khan'],
                ['⏱️ ETA', '12 minutes'],
                ['💰 Budget', '₹700'],
                ['📍 Address', 'Noida Sector 50'],
                ['📞 Support', '+91 98765 43210'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-2 rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-sm text-slate-400">{label}</p>
                  <p className="text-sm font-semibold text-slate-900 text-right">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-2">
              <a href="tel:+919876543210" className="gradient-button w-full text-sm py-3">
                📞 Call Worker
              </a>
              <button type="button" className="secondary-button w-full text-sm py-3">
                Cancel Booking
              </button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

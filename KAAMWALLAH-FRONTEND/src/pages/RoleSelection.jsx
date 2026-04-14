import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoleRedirect, useAppContext } from '../context/AppContext';

const roles = [
  {
    id: 'hirer',
    emoji: '🏠',
    title: 'Hire Workers',
    titleHi: 'कारीगर रखें',
    description: 'Post household jobs, browse verified workers, and track bookings in real time.',
    cta: 'Continue as Client',
    color: 'from-cyan-500 to-sky-600',
    features: ['Post jobs', 'Browse workers', 'Track bookings'],
  },
  {
    id: 'worker',
    emoji: '🔧',
    title: 'Find Work',
    titleHi: 'काम खोजें',
    description: 'Discover nearby job requests, manage active bookings, and grow your earnings.',
    cta: 'Continue as Worker',
    color: 'from-violet-500 to-purple-600',
    features: ['Browse jobs', 'Accept requests', 'Track earnings'],
  },
];

export default function RoleSelection() {
  const navigate = useNavigate();
  const { isAuthenticated, role, setRole, t } = useAppContext();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    if (role) {
      navigate(getRoleRedirect(role), { replace: true });
    }
  }, [isAuthenticated, navigate, role]);

  function handleSelect(roleId) {
    setRole(roleId);
    navigate(getRoleRedirect(roleId), { replace: true });
  }

  if (role) return null;

  return (
    <div className="surface-card w-full max-w-2xl p-6 sm:p-10 page-enter">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-cyan-700">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
          One more step
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
          {t('chooseRole')}
        </h1>
        <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
          Select how you want to use Kaam Wallah. You can switch roles anytime from your profile.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {roles.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelect(item.id)}
            id={`role-${item.id}`}
            className="group rounded-[2rem] bg-white p-6 text-left shadow-soft border border-slate-100 transition duration-300 hover:-translate-y-2 hover:shadow-[0_24px_60px_-20px_rgba(6,182,212,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            {/* Icon */}
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} shadow-md text-3xl`}>
              {item.emoji}
            </div>

            {/* Title */}
            <h2 className="mt-5 text-xl font-extrabold text-slate-900">
              {item.title}
              <span className="ml-2 text-sm font-normal text-slate-400">· {item.titleHi}</span>
            </h2>

            {/* Description */}
            <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>

            {/* Features */}
            <ul className="mt-4 space-y-1.5">
              {item.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <span className={`mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br ${item.color} px-4 py-2 text-sm font-bold text-white shadow-md group-hover:shadow-lg transition-shadow`}>
              {item.cta} →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

import { NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function JobsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path d="M4 7h16v11H4z M9 7V5h6v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
      <path d="M12 5v14 M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function DashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path d="M4 4h7v7H4z M13 4h7v4h-7z M13 10h7v10h-7z M4 13h7v7H4z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const items = [
  { key: 'home', to: '/', icon: HomeIcon },
  { key: 'jobs', to: '/jobs', icon: JobsIcon },
  { key: 'postJob', to: '/post-job', icon: PlusIcon, accent: true },
  { key: 'dashboard', to: '/dashboard', icon: DashIcon },
];

export default function BottomNav() {
  const { t, unreadCount } = useAppContext();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 py-3 lg:px-4 backdrop-blur-xl md:hidden pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex max-w-sm items-center justify-around relative">
        {items.map((item) => {
          if (item.accent) {
            return (
              <div key={item.to} className="relative -top-6 flex flex-col items-center justify-center">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-center rounded-full h-14 w-14 shadow-[0_8px_30px_rgba(6,182,212,0.6)] ${
                      isActive ? 'bg-cyan-600' : 'bg-cyan-500 hover:bg-cyan-600'
                    } text-white transition-transform active:scale-95`
                  }
                >
                  <item.icon />
                </NavLink>
                <span className="text-[10px] font-bold text-slate-700 mt-1">{t(item.key)}</span>
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 min-w-[64px] transition-all duration-200 ${
                  isActive ? 'text-cyan-600' : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                    <item.icon />
                  </span>
                  <span className="text-[10px] font-bold">{t(item.key)}</span>
                </>
              )}
            </NavLink>
          );
        })}

        {/* Notifications tab */}
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `relative flex flex-col items-center gap-1 min-w-[64px] transition-all duration-200 ${
              isActive ? 'text-cyan-600' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <div className="relative">
             <BellIcon />
             {unreadCount > 0 && (
               <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white border-2 border-white">
                 {unreadCount > 9 ? '9+' : unreadCount}
               </span>
             )}
          </div>
          <span className="text-[10px] font-bold">{t('notifications')}</span>
        </NavLink>
      </div>
    </div>
  );
}

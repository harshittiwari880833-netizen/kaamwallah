import { useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotifIcon({ type }) {
  const icons = {
    hire_request: '💼',
    job_accepted: '✅',
    job_rejected: '❌',
    new_job: '🔔',
    message: '💬',
  };
  return <span className="text-xl">{icons[type] || '🔔'}</span>;
}

export default function NotificationPanel({ onClose }) {
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadCount, role, t } = useAppContext();
  const panelRef = useRef(null);
  const myNotifications = notifications.filter(n => !n.roleTarget || n.roleTarget === role);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full z-50 mt-2 w-80 sm:w-96 animate-scale-in"
    >
      <div className="surface-card overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold text-slate-900">{t('notifications')}</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="text-xs font-semibold text-cyan-600 hover:text-cyan-800 transition"
            >
              {t('markAllRead')}
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-96 overflow-y-auto">
          {myNotifications.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="text-4xl">🔔</span>
              <p className="text-sm text-slate-500">{t('noNotifications')}</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {myNotifications.map((notif) => (
                <li
                  key={notif.id}
                  className={`flex gap-3 px-5 py-4 transition cursor-pointer hover:bg-slate-50 ${!notif.read ? 'bg-cyan-50/50' : ''}`}
                  onClick={() => markNotificationRead(notif.id)}
                >
                  <NotifIcon type={notif.type} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold leading-tight ${!notif.read ? 'text-slate-900' : 'text-slate-600'}`}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-500" />
                      )}
                    </div>
                    {notif.message && (
                      <p className="mt-0.5 text-xs text-slate-500 leading-5">{notif.message}</p>
                    )}
                    <p className="mt-1 text-[11px] text-slate-400">{timeAgo(notif.timestamp)}</p>

                    {/* Accept/Reject for job requests */}
                    {notif.type === 'hire_request' && !notif.actioned && (
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition"
                        >
                          {t('accept')}
                        </button>
                        <button
                          type="button"
                          className="rounded-xl bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-300 transition"
                        >
                          {t('reject')}
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

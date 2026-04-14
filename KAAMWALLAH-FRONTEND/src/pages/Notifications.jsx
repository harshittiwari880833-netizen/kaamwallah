import { useAppContext } from '../context/AppContext';
import PageHeader from '../components/PageHeader';

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_ICONS = {
  hire_request: '💼',
  job_accepted: '✅',
  job_rejected: '❌',
  new_job: '📋',
  message: '💬',
};

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadCount, t, role } = useAppContext();
  const filteredNotifs = notifications.filter(n => !n.roleTarget || n.roleTarget === role);

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <PageHeader
          eyebrow={t('notifications')}
          title="Your Activity"
          description="Stay updated on job requests, acceptances, and messages."
        />
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="secondary-button text-sm px-4 py-2"
          >
            {t('markAllRead')}
          </button>
        )}
      </div>

      <div className="surface-card overflow-hidden">
        {filteredNotifs.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="text-5xl">🔔</span>
            <h3 className="text-lg font-bold text-slate-700">{t('noNotifications')}</h3>
            <p className="text-sm text-slate-400 max-w-xs">
              You're all caught up! Notifications will appear here when there's activity on your account.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {filteredNotifs.map((notif) => (
              <li
                key={notif.id}
                className={`flex gap-4 px-6 py-5 cursor-pointer transition hover:bg-slate-50 ${!notif.read ? 'bg-cyan-50/40' : ''}`}
                onClick={() => markNotificationRead(notif.id)}
              >
                <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                  {TYPE_ICONS[notif.type] || '🔔'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-sm font-semibold ${!notif.read ? 'text-slate-900' : 'text-slate-600'}`}>
                      {notif.title}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-cyan-500" />
                      )}
                      <span className="text-xs text-slate-400">{timeAgo(notif.timestamp)}</span>
                    </div>
                  </div>
                  {notif.message && (
                    <p className="mt-0.5 text-sm text-slate-500">{notif.message}</p>
                  )}
                  {notif.type === 'hire_request' && !notif.actioned && (
                    <div className="mt-3 flex gap-2">
                      <button type="button" className="accept-button">
                        {t('accept')}
                      </button>
                      <button type="button" className="reject-button">
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
  );
}

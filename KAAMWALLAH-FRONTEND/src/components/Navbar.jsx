import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import AvatarBadge from './AvatarBadge';
import NotificationPanel from './NotificationPanel';

const navItems = [
  { key: 'home', to: '/' },
  { key: 'jobs', to: '/jobs' },
  { key: 'dashboard', to: '/dashboard' },
  { key: 'support', to: '/support' },
];

function navClass({ isActive }) {
  return `rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
    isActive
      ? 'bg-cyan-50 text-cyan-700 shadow-sm'
      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
  }`;
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { language, setLanguage, user, logout, t, unreadCount } = useAppContext();

  return (
    <header className="sticky top-0 z-40">
      <nav className="navbar-glass mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 shadow-md">
              <span className="text-lg font-black text-white">K</span>
            </div>
            <div>
              <p className="font-extrabold tracking-tight text-slate-900 leading-none">
                Kaam<span className="gradient-text">Wallah</span>
              </p>
              <p className="text-[10px] text-slate-400">Trusted local workforce</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass} end={item.to === '/'}>
                {t(item.key)}
              </NavLink>
            ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden items-center gap-2 md:flex">
            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-200"
              id="language-toggle"
              title="Toggle language"
            >
              {language === 'en' ? 'हिं' : 'EN'}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                id="notification-bell"
                aria-label="Notifications"
              >
                <BellIcon />
                {unreadCount > 0 && (
                  <span className="notif-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
              {notifOpen && (
                <NotificationPanel onClose={() => setNotifOpen(false)} />
              )}
            </div>

            {/* Auth buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-full bg-white px-2 py-1.5 shadow-soft hover:shadow-md transition"
                >
                  <AvatarBadge seed={user.name || user.email || user.phone || 'KW'} size="sm" imgSrc={user?.profilePic} />
                  <span className="pr-2 text-sm font-semibold text-slate-700">
                    {user.name || 'Profile'}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="secondary-button px-4 py-2 text-sm"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="secondary-button px-4 py-2 text-sm">
                  {t('login')}
                </Link>
                <Link to="/signup" className="gradient-button px-4 py-2 text-sm">
                  {t('signup')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: Bell + Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Notification Bell Mobile */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                aria-label="Notifications"
              >
                <BellIcon />
                {unreadCount > 0 && (
                  <span className="notif-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
              {notifOpen && (
                <NotificationPanel onClose={() => setNotifOpen(false)} />
              )}
            </div>

            {/* Hamburger */}
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              <span className="space-y-1.5">
                <span className={`block h-0.5 w-5 rounded-full bg-white transition-all ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
                <span className={`block h-0.5 w-5 rounded-full bg-white transition ${menuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-5 rounded-full bg-white transition-all ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mt-3 rounded-3xl bg-white/95 p-3 shadow-soft md:hidden animate-scale-in">
            <div className="flex flex-col gap-1.5">
              {/* Language */}
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                className="rounded-full bg-slate-100 px-4 py-2.5 text-left text-sm font-bold text-slate-700"
              >
                🌐 {language === 'en' ? 'Switch to हिंदी' : 'Switch to English'}
              </button>

              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={navClass}
                  end={item.to === '/'}
                  onClick={() => setMenuOpen(false)}
                >
                  {t(item.key)}
                </NavLink>
              ))}
              <NavLink to="/post-job" className={navClass} onClick={() => setMenuOpen(false)}>
                {t('postJob')}
              </NavLink>

              <div className="mt-1 grid gap-2 pt-1">
                {!user ? (
                  <>
                    <Link
                      to="/login"
                      className="secondary-button w-full"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t('login')}
                    </Link>
                    <Link
                      to="/signup"
                      className="gradient-button w-full"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t('signup')}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      className="secondary-button w-full"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t('profile')}
                    </Link>
                    <button
                      type="button"
                      className="danger-button w-full text-sm"
                      onClick={() => { logout(); setMenuOpen(false); }}
                    >
                      {t('logout')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

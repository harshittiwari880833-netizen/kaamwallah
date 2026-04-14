import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import PageTransition from '../components/PageTransition';

export default function AppShell() {
  const [errorToast, setErrorToast] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    function handleApiError(event) {
      setErrorToast(event.detail?.message || 'Something went wrong');
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setErrorToast(''), 3500);
    }

    window.addEventListener('kaamwallah:api-error', handleApiError);
    return () => {
      window.removeEventListener('kaamwallah:api-error', handleApiError);
      window.clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-hero-radial text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-24 sm:px-6 lg:px-8">
        <Navbar />
        <main className="flex-1 py-6 sm:py-8">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        
        {/* Toast Notification container */}
        <div className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-[100] flex flex-col gap-2 pointer-events-none">
          {errorToast && (
            <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 shadow-[0_16px_40px_-12px_rgba(244,63,94,0.3)] ring-1 ring-rose-100 animate-scale-in">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white font-bold shadow-sm">
                !
              </span>
              {errorToast}
              <button onClick={() => setErrorToast('')} className="ml-2 text-slate-400 hover:text-slate-600 transition">
                ✕
              </button>
            </div>
          )}
        </div>
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
}

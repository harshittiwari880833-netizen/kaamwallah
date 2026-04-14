import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-hero-radial px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Left brand panel */}
        <section className="hidden rounded-[2.5rem] bg-slate-950 p-10 text-white shadow-[0_32px_80px_-20px_rgba(8,145,178,0.3)] lg:flex lg:flex-col lg:justify-between overflow-hidden relative">
          {/* Background blobs */}
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute -left-10 bottom-10 h-60 w-60 rounded-full bg-sky-500/10 blur-3xl" />

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 shadow-lg">
                <span className="text-xl font-black text-white">K</span>
              </div>
              <div>
                <p className="text-xl font-extrabold text-white">KaamWallah</p>
                <p className="text-xs text-slate-400">India's trusted labour marketplace</p>
              </div>
            </Link>

            <h1 className="mt-14 max-w-md text-5xl font-extrabold leading-[1.1] tracking-tight">
              Hire faster.<br />
              Get discovered<br />
              <span className="text-cyan-400">locally.</span>
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              A production-grade labour marketplace with OTP authentication, real-time job tracking,
              and mobile-first workflows for Indian households.
            </p>

            {/* Features list */}
            <div className="mt-8 space-y-3">
              {[
                '🔒 OTP-based secure authentication',
                '🔍 Find verified workers near you',
                '📋 Post jobs and track bookings',
                '⭐ Rate and review workers',
              ].map((f) => (
                <div key={f} className="flex items-center gap-3 text-sm text-slate-300">
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="relative z-10 grid grid-cols-3 gap-3">
            {[
              ['2,500+', 'Verified Workers'],
              ['12 min', 'Avg Response'],
              ['4.8 ★', 'Customer Rating'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-white/8 border border-white/10 p-4 backdrop-blur">
                <p className="text-xl font-extrabold text-white">{value}</p>
                <p className="mt-0.5 text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Right auth form */}
        <section className="flex items-center justify-center py-8">
          <div className="w-full max-w-lg">
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
}

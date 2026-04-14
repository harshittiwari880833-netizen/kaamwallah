import { Link } from 'react-router-dom';

export default function Signup() {
  return (
    <div className="surface-card w-full max-w-2xl p-6 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
        Create account
      </p>
      <h1 className="mt-3 font-display text-3xl font-extrabold text-slate-950">
        Start with OTP verification
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Kaam Wallah now uses a phone-first authentication flow. Verify your number once and then
        choose whether you want to hire workers or find work.
      </p>

      <div className="mt-6 rounded-[1.75rem] bg-slate-50 p-5">
        <p className="text-sm text-slate-500">What happens next</p>
        <div className="mt-4 grid gap-3">
          {[
            'Enter your phone number',
            'Receive and verify a 6-digit OTP',
            'Choose your role and continue',
          ].map((step) => (
            <div key={step} className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
              {step}
            </div>
          ))}
        </div>
      </div>

      <Link to="/login" className="gradient-button mt-6 w-full">
        Continue with OTP
      </Link>
    </div>
  );
}

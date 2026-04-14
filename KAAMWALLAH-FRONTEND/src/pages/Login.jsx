import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OtpInput from '../components/OtpInput';
import { sendOtp, verifyOtp } from '../services/auth';
import { getRoleRedirect, useAppContext } from '../context/AppContext';

const RESEND_SECONDS = 30;

function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return null;
  return `+91${digits}`;
}

export default function Login() {
  const navigate = useNavigate();
  const { role, setAuthSession, setAuthLoading, authLoading, isAuthenticated, t } = useAppContext();

  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(getRoleRedirect(role), { replace: true });
    }
  }, [isAuthenticated, navigate, role]);

  useEffect(() => {
    if (!countdown) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function handleSendOtp(e) {
    e.preventDefault();
    setFieldError('');
    setStatus({ type: '', message: '' });
    const formatted = normalizePhone(phone);
    if (!formatted) {
      setFieldError('Enter a valid 10-digit phone number');
      return;
    }
    try {
      setAuthLoading(true);
      await sendOtp(formatted);
      setStep('otp');
      setCountdown(RESEND_SECONDS);
      setStatus({ type: 'success', message: t('otpSent') });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to send OTP' });
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setFieldError('');
    setStatus({ type: '', message: '' });
    if (otp.length !== 6) {
      setFieldError('Enter the 6-digit OTP');
      return;
    }
    try {
      setAuthLoading(true);
      const payload = await verifyOtp({
        phone: normalizePhone(phone),
        otp,
        role: 'client',
        name: name.trim() || `User_${phone.slice(-4)}`,
      });
      // setAuthSession({
      //   token: payload?.accessToken || 'mock-token',
      //   user: payload?.user || {
      //     name: name.trim() || `User_${phone.slice(-4)}`,
      //     phone: normalizePhone(phone),
      //     id: Date.now().toString(),
      //   },
      // });
      const finalUser = {
        ...(payload?.user || {}),
        name: name.trim() || payload?.user?.name || `User_${phone.slice(-4)}`,
        phone: normalizePhone(phone),
      };

      setAuthSession({
        token: payload?.accessToken || 'mock-token',
        user: finalUser,
      });
      navigate('/role-selection', { replace: true });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'OTP verification failed' });
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleResendOtp() {
    if (countdown > 0) return;
    try {
      setAuthLoading(true);
      await sendOtp(normalizePhone(phone));
      setCountdown(RESEND_SECONDS);
      setStatus({ type: 'success', message: 'OTP resent successfully' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to resend OTP' });
    } finally {
      setAuthLoading(false);
    }
  }

  return (
    <div className="surface-card w-full max-w-lg p-6 sm:p-8 page-enter">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cyan-700">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
            {t('loginWithOtp')}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-900 leading-tight">
            Sign in with your phone
          </h1>
          <p className="mt-2 text-sm text-slate-500 leading-6">
            Fast and secure OTP-based authentication for Kaam Wallah users.
          </p>
        </div>
        <Link to="/" className="secondary-button hidden sm:inline-flex text-sm px-4 py-2">
          {t('backHome')}
        </Link>
      </div>

      {/* Status message */}
      {status.message && (
        <div
          className={`mt-5 rounded-2xl px-4 py-3 text-sm font-medium ${status.type === 'error'
              ? 'bg-rose-50 text-rose-700'
              : 'bg-emerald-50 text-emerald-700'
            }`}
        >
          {status.message}
        </div>
      )}

      {step === 'phone' ? (
        <form className="mt-6 grid gap-4" onSubmit={handleSendOtp}>
          <div>
            <label className="form-label">{t('phoneNumber')}</label>
            <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition focus-within:border-cyan-300 focus-within:shadow-[0_0_0_4px_rgba(34,211,238,0.1)]">
              <span className="flex items-center border-r border-slate-200 px-4 text-sm font-bold text-slate-500 bg-slate-50">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full px-4 py-3 text-sm outline-none placeholder:text-slate-400"
                placeholder="9876543210"
                id="phone-input"
                autoFocus
              />
            </div>
            {fieldError && <p className="form-error">{fieldError}</p>}
          </div>

          <button
            type="submit"
            className="gradient-button mt-1 w-full text-base"
            disabled={authLoading}
            id="send-otp-btn"
          >
            {authLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin-slow" />
                Sending…
              </span>
            ) : t('sendOtp')}
          </button>
        </form>
      ) : (
        <form className="mt-6 grid gap-4" onSubmit={handleVerifyOtp}>
          {/* Phone reminder */}
          <div className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm">
            <p className="text-slate-500">OTP sent to</p>
            <p className="mt-1 font-bold text-slate-900">{normalizePhone(phone)}</p>
          </div>

          {/* Name input */}
          <div>
            <label className="form-label">Your Name (Optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="e.g. Rahul Sharma"
              disabled={authLoading}
            />
          </div>

          {/* OTP boxes */}
          <div>
            <label className="form-label">{t('enterOtp')}</label>
            <div className="rounded-2xl bg-slate-50 p-3">
              <OtpInput value={otp} onChange={setOtp} disabled={authLoading} />
            </div>
            {fieldError && <p className="form-error">{fieldError}</p>}
          </div>

          {/* Resend / Change */}
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => { setStep('phone'); setOtp(''); setFieldError(''); }}
              className="font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              {t('changeNumber')}
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={countdown > 0 || authLoading}
              className="font-semibold text-cyan-700 transition disabled:text-slate-400"
            >
              {countdown > 0 ? `${t('resendIn')} ${countdown}${t('seconds')}` : t('resendOtp')}
            </button>
          </div>

          <button
            type="submit"
            className="gradient-button w-full text-base"
            disabled={authLoading}
            id="verify-otp-btn"
          >
            {authLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin-slow" />
                Verifying…
              </span>
            ) : t('verifyOtp')}
          </button>
        </form>
      )}

      <p className="mt-6 text-sm text-slate-500">
        {t('noAccount')}{' '}
        <Link to="/signup" className="font-bold text-cyan-700 hover:underline">
          {t('signUpHere')}
        </Link>
      </p>
    </div>
  );
}
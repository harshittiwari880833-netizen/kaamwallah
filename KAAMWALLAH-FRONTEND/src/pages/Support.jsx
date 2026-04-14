import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { useAppContext } from '../context/AppContext';

const FAQ_ITEMS = [
  {
    q: 'How do I book a worker?',
    a: 'Search for the service you need, browse available workers near you, and click "Hire Now". Fill in the job details and submit your request.',
  },
  {
    q: 'Are all workers verified?',
    a: 'Yes, all workers on Kaam Wallah go through an identity verification process before they can accept jobs.',
  },
  {
    q: 'How do I track my booking?',
    a: 'Go to Dashboard → Active Jobs to track your booking status in real time. You can also use the Track Job page.',
  },
  {
    q: 'Can I cancel a booking?',
    a: 'Yes, you can cancel up to 2 hours before the scheduled time without any charges. Contact support for help.',
  },
  {
    q: 'How does payment work?',
    a: 'Payment is made directly to the worker after job completion. You can pay cash or digitally via UPI.',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${open ? 'border-cyan-200 bg-cyan-50/50' : 'border-slate-100 bg-slate-50'}`}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-sm font-semibold text-slate-800">{q}</span>
        <span className={`ml-4 flex-shrink-0 text-cyan-500 text-xl transition-transform duration-200 ${open ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-slate-600 leading-6 animate-scale-in">
          {a}
        </div>
      )}
    </div>
  );
}

export default function Support() {
  const { t } = useAppContext();

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        eyebrow={t('helpCenter')}
        title={t('howCanWeHelp')}
        description="Find answers to common questions or reach our support team directly."
      />

      {/* Contact cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="surface-card p-6 flex flex-col gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 text-2xl shadow-md">
            📞
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">{t('callUs')}</p>
            <h2 className="mt-2 text-xl font-extrabold text-slate-900">+91 98765 43210</h2>
            <p className="mt-1 text-sm text-slate-500">Mon – Sat, 9 AM – 7 PM</p>
          </div>
          <a href="tel:+919876543210" className="gradient-button text-sm px-4 py-2.5 mt-auto w-full sm:w-auto">
            Call Now
          </a>
        </article>

        <article className="surface-card p-6 flex flex-col gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-2xl shadow-md">
            ✉️
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-violet-600">{t('emailUs')}</p>
            <h2 className="mt-2 text-xl font-extrabold text-slate-900 break-all">support@kaamwallah.in</h2>
            <p className="mt-1 text-sm text-slate-500">Usually replies in 4–6 hours</p>
          </div>
          <a href="mailto:kaamwallah01@gmail.com" className="gradient-button text-sm px-4 py-2.5 mt-auto w-full sm:w-auto">
            Email Support
          </a>
        </article>

        <article className="surface-card p-6 flex flex-col gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl shadow-md">
            💬
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">{t('chatSupport')}</p>
            <h2 className="mt-2 text-xl font-extrabold text-slate-900">WhatsApp Chat</h2>
            <p className="mt-1 text-sm text-slate-500">Available 24×7 for urgent issues</p>
          </div>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-button text-sm px-4 py-2.5 mt-auto w-full sm:w-auto"
          >
            Chat Now
          </a>
        </article>
      </section>

      {/* FAQ */}
      <section className="surface-card p-6">
        <h2 className="section-title text-2xl mb-5">{t('faq')}</h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <FAQItem key={item.q} {...item} />
          ))}
        </div>
      </section>
    </div>
  );
}

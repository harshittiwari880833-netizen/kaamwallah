export default function Footer() {
  return (
    <footer className="mt-12 hidden rounded-[2rem] bg-slate-950 px-6 py-8 text-slate-300 shadow-soft md:block">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <p className="font-display text-xl font-extrabold text-white">Kaam Wallah</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            A premium labour marketplace designed for trusted local hiring, worker discovery, and
            fast mobile booking across Indian cities.
          </p>
        </div>
        <div className="grid gap-2 text-sm text-slate-400">
          <p>Home services, worker discovery, and job posting in one streamlined flow.</p>
          <p>OTP auth, bilingual navigation, and responsive product UI included.</p>
        </div>
      </div>
    </footer>
  );
}

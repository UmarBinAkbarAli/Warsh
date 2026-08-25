// Hand-built phone mockup. Replaces warsh-app/assets/images/hero-phone.png,
// whose exported text is clipped mid-word ("A small, steady readin", "TODAY'S GO").
// Rendering it in markup keeps it crisp at any resolution and easy to keep on-brand.
export function PhoneMockup() {
  return (
    <div
      aria-hidden
      className="mx-auto w-full max-w-[300px] rounded-[2.25rem] border-[10px] border-navy bg-white shadow-lifted"
    >
      <div className="rounded-[1.5rem] bg-cream-bg px-4 pb-4 pt-3">
        <div className="flex items-center justify-between text-[10px] font-semibold text-ink/50">
          <span>9:41</span>
          <span className="flex gap-1">
            <span className="h-2 w-3 rounded-sm bg-ink/25" />
            <span className="h-2 w-3 rounded-sm bg-ink/25" />
          </span>
        </div>

        <div className="mt-4 flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-bold leading-tight text-ink">Assalamu alaikum</p>
            <p className="mt-0.5 text-[11px] leading-snug text-deep/70">
              A small, steady reading habit
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-sage-soft/30 px-2 py-1 text-[10px] font-bold text-sage-deep">
            3 days
          </span>
        </div>

        <div className="mt-4 rounded-lg bg-navy p-3.5">
          <p className="text-[10px] font-bold text-gold">Chapter 2 &middot; Lesson 3</p>
          <p className="font-arabic mt-1.5 text-lg leading-tight text-cream-bg">
            اَلْجُمْلَةُ الْفِعْلِيَّة
          </p>
          <p className="mt-1 text-xs font-semibold text-cream-bg">The verbal sentence</p>
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-cream-bg/70">
            <span>Current lesson</span>
            <span className="font-bold text-cream-bg">3 of 6</span>
          </div>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-cream-bg/20">
            <div className="h-full w-1/2 rounded-full bg-gold" />
          </div>
        </div>

        <p className="mt-4 text-xs font-bold text-ink">Today</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-md bg-parchment-soft p-2.5">
            <p className="text-[9px] font-bold uppercase tracking-wide text-deep/60">
              Today&apos;s goal
            </p>
            <p className="mt-1 text-xs font-bold text-ink">1 lesson</p>
            <p className="text-[10px] text-deep/60">10 min</p>
          </div>
          <div className="rounded-md bg-sage-soft/20 p-2.5">
            <p className="text-[9px] font-bold uppercase tracking-wide text-deep/60">
              Word of the day
            </p>
            <p className="font-arabic mt-0.5 text-base leading-tight text-ink">نُور</p>
            <p className="text-[10px] text-deep/70">Light</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-navy/10 pt-3 text-[10px] font-semibold">
          <span className="text-gold-deep">Learn</span>
          <span className="text-deep/40">Vocabulary</span>
          <span className="text-deep/40">Noor</span>
          <span className="text-deep/40">You</span>
        </div>
      </div>
    </div>
  );
}

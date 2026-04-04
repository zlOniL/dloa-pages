export function PartnersSection({ content }: { content?: any }) {
  const strip = content?._images?.strip ?? '/assets/partners-strip.svg';

  return (
    <section className="w-full pt-4 pb-10 bg-white overflow-hidden">
      <div className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 md:w-24 z-10 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 md:w-24 z-10 bg-gradient-to-l from-white to-transparent" />
        <div className="partners-marquee flex items-center w-max">
          <img src={strip} alt="Farmácias parceiras" className="block h-20 md:h-[110px] w-auto max-w-none object-contain shrink-0" />
          <img src={strip} alt="" aria-hidden="true" className="block h-20 md:h-[110px] w-auto max-w-none object-contain shrink-0" />
        </div>
      </div>
      <style>{`
        .partners-marquee { animation: partners-scroll 40s linear infinite; }
        @keyframes partners-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
    </section>
  );
}

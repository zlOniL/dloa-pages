export function HowItWorks({ content }: { content?: any }) {
  const steps = content?._images?.steps ?? '/assets/como-funciona-steps.svg';

  return (
    <section id="como-funciona" className="w-full py-10 md:py-16 lg:py-20" style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="max-w-[1100px] mx-auto px-4 md:px-5">
        <h2 className="text-white text-center text-2xl md:text-3xl lg:text-[42px] font-semibold mb-8 md:mb-10 lg:mb-14 uppercase">
          Como funciona
        </h2>
        <div className="flex justify-center mb-8 md:mb-12 lg:mb-16 relative">
          <img
            src={steps}
            alt="Passos de como funciona o programa"
            className="w-full max-w-[800px]"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

export function AboutSection({ content }: { content?: any }) {
  const banner = content?._images?.banner ?? '/assets/about-banner.png';

  return (
    <section id="sobre" className="w-full relative bg-white">
      <img
        src={banner}
        alt="Sobre o programa"
        className="w-full h-auto block"
        loading="lazy"
      />
    </section>
  );
}

'use client';
import { Navigation, NavItem } from './Navigation';

interface HeroBannerContent {
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaTarget?: string;
  logoUrl?: string;
  _navItems?: NavItem[];
}

export function HeroBanner({ content, slug }: { content: HeroBannerContent; slug: string }) {
  const handleCadastreClick = () => {
    const target = content.ctaTarget ?? '';
    if (!target) return;
    if (target.startsWith('http') || target.startsWith('/')) {
      window.open(target, '_blank', 'noopener noreferrer');
    } else {
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const desktopImg = (content as any)._images?.desktopProducts ?? '/assets/hero-products.png';
  const mobileImg  = (content as any)._images?.mobileProducts  ?? '/assets/hero-products-mobile.png';

  return (
    <header className="w-full min-h-[500px] md:min-h-[550px] lg:min-h-[600px] relative overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundColor: 'var(--color-primary)' }} />

      <Navigation slug={slug} logoUrl={content.logoUrl} navItems={content._navItems} />

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-20 pt-[170px] md:pt-[190px] lg:pt-[200px] pb-8 md:pb-12 relative">
        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between lg:gap-4">

          <div className="w-full flex items-center justify-center lg:hidden mb-4">
            <img
              src={mobileImg}
              alt="Produtos participantes"
              className="w-[480px] sm:w-[540px] md:w-[600px] h-auto"
            />
          </div>

          <div className="w-full lg:w-[45%] text-center lg:text-left pb-2 lg:pb-12">
            <h1 className="text-white text-[28px] sm:text-[30px] md:text-[34px] lg:text-[32px] font-bold mb-2 md:mb-3 leading-tight">
              {content.title}
            </h1>

            <p className="text-white text-[21px] sm:text-[23px] md:text-[26px] lg:text-[27px] font-normal mb-5 md:mb-6 opacity-90 max-w-md mx-auto lg:mx-0 lg:max-w-none"
              dangerouslySetInnerHTML={{ __html: content.subtitle }}
            />

            <button
              onClick={handleCadastreClick}
              className="cursor-pointer rounded-full px-8 py-3 text-white font-extrabold text-lg md:text-xl lg:text-2xl transition-opacity duration-200 hover:opacity-85"
              style={{ backgroundColor: 'var(--color-secondary)' }}
            >
              {content.ctaText ?? 'Quero participar'}
            </button>
          </div>

          <div className="hidden lg:flex w-[55%] items-end justify-end">
            <img
              src={desktopImg}
              alt="Produtos participantes"
              className="w-[640px] h-auto drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

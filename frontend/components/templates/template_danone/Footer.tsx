'use client';

export interface FooterLink { label: string; href: string }

const DEFAULT_FOOTER_LINKS: FooterLink[] = [
  { label: 'Início',        href: '' },
  { label: 'Sobre nós',     href: 'sobre' },
  { label: 'Como funciona', href: 'como-funciona' },
  { label: 'Dúvidas',       href: 'duvidas' },
];

interface FooterProps {
  footerLogoUrl?: string;
  footerLinks?: FooterLink[];
}

export function Footer({ footerLogoUrl, footerLinks }: FooterProps) {
  const links = footerLinks?.length ? footerLinks : DEFAULT_FOOTER_LINKS;

  const handleClick = (href: string) => {
    if (href.startsWith('http') || href.startsWith('/')) {
      window.open(href, '_blank', 'noopener noreferrer');
      return;
    }
    if (!href) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    document.getElementById(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="w-full py-6 px-4 md:px-8" style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="max-w-[1300px] mx-auto flex flex-col items-center justify-center gap-4 xl:flex-row xl:gap-12">
        <div className="flex-shrink-0">
          <img
            src={footerLogoUrl ?? '/assets/logo-meu-cupom-danone.webp'}
            alt="Logo"
            className="h-[56px] sm:h-[68px] xl:h-[82px] w-auto"
          />
        </div>
        <nav className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 xl:gap-8">
            {links.map((item, i) => (
              <button
                key={i}
                onClick={() => handleClick(item.href)}
                className="text-white text-sm xl:text-base hover:opacity-80 transition-opacity px-2 py-1"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="hidden xl:flex items-center gap-6">
            <a href="https://www.danone.com/br/pt/legal-pages/cookies-policy.html" target="_blank" rel="noopener noreferrer" className="text-white text-sm xl:text-base hover:opacity-80 transition-opacity px-2 py-1">
              Política de Cookies
            </a>
            <a href="https://www.danone.com/br/pt/legal-pages/privacy.html" target="_blank" rel="noopener noreferrer" className="text-white text-sm xl:text-base hover:opacity-80 transition-opacity px-2 py-1">
              Aviso de Privacidade
            </a>
          </div>
        </nav>
      </div>
    </footer>
  );
}

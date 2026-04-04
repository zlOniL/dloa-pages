'use client';
import { useState } from 'react';
import Link from 'next/link';

export interface NavItem { label: string; href: string }

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: 'Início',        href: '' },
  { label: 'Produtos',      href: 'produtos' },
  { label: 'Sobre nós',     href: 'sobre' },
  { label: 'Como funciona', href: 'como-funciona' },
  { label: 'Dúvidas',       href: 'duvidas' },
];

interface NavigationProps {
  slug: string;
  logoUrl?: string;
  navItems?: NavItem[];
}

function resolveHref(href: string) {
  if (!href) return null; // scroll to top
  if (href.startsWith('http') || href.startsWith('/')) return href; // external / absolute
  return null; // treat as section id
}

export function Navigation({ slug, logoUrl, navItems }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const items = navItems?.length ? navItems : DEFAULT_NAV_ITEMS;

  const handleClick = (href: string) => {
    setIsMobileMenuOpen(false);
    const external = resolveHref(href);
    if (external) { window.open(external, '_blank', 'noopener noreferrer'); return; }
    if (!href) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    document.getElementById(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 flex justify-center px-2 sm:px-4 md:px-8">
      <div className="max-w-full">
        <div className="relative bg-[#F5F5F5] px-6 sm:px-8 md:px-9 lg:px-11 py-[30px] sm:py-[32px] md:py-[31px] lg:py-[35px] flex items-center justify-between rounded-b-[28px] sm:rounded-b-[36px] md:rounded-b-[52px] lg:justify-center lg:gap-6 xl:gap-8 w-full max-lg:min-w-[90vw]">

          <Link href={`/${slug}`} className="shrink-0">
            <img
              src={logoUrl ?? '/assets/header-logo.svg'}
              alt="Logo"
              className="w-[115px] sm:w-[125px] md:w-[113px] lg:w-[139px] h-auto"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-3 xl:gap-5">
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => handleClick(item.href)}
                className="text-[#4A5568] text-[21px] xl:text-[23px] font-bold cursor-pointer whitespace-nowrap px-1"
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleClick('como-funciona')}
            className="hidden lg:block border-2 border-[var(--color-secondary)] bg-[#F5F5F5] text-[var(--color-secondary)] text-sm lg:text-xl font-extrabold px-4 lg:px-8 py-1 lg:py-2 rounded-full shrink-0 hover:bg-[var(--color-secondary)] hover:text-white transition-colors whitespace-nowrap"
          >
            Como funciona
          </button>

          <button
            className="lg:hidden text-[34px] sm:text-[36px] text-[#4A5568] p-1 sm:p-2 bg-transparent border-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#F5F5F5] rounded-2xl p-4 sm:p-5 shadow-lg w-full mt-3">
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => handleClick(item.href)}
                className="block w-full text-left text-[#4A5568] text-sm sm:text-base font-normal py-2.5 sm:py-3 hover:text-[var(--color-secondary)] transition-colors border-b border-gray-100 last:border-0"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

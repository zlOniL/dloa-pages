'use client';
import { useState, useRef, useEffect } from 'react';

interface HeroContent {
  line1?: string;
  line2?: string;
  line3?: string;
  ctaText?: string;
  _videos?: { backgroundVideo?: string };
  _navItems?: { label: string; href: string }[];
  logoUrl?: string;
}

export function HeroBanner({ content, slug }: { content: HeroContent; slug?: string }) {
  const {
    line1    = 'AI FILM',
    line2    = 'PRODUCTION',
    line3    = 'WITHOUT LIMITS',
    ctaText  = 'Book a Call',
    _videos  = {},
    _navItems,
    logoUrl,
  } = content ?? {};

  const [isMuted, setIsMuted]           = useState(true);
  const [isScrolled, setIsScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const DEFAULT_VIDEO = 'https://mojli.s3.us-east-2.amazonaws.com/Mojli+Website+upscaled+(12mb).webm';
  const videoSrc = _videos?.backgroundVideo || DEFAULT_VIDEO;

  const navItems = _navItems?.length ? _navItems : [
    { label: 'Work',         href: 'portfolio' },
    { label: 'Process',      href: 'about' },
    { label: 'Capabilities', href: 'services' },
    { label: 'Contact',      href: 'contact' },
  ];

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.muted  = isMuted;
    videoRef.current.volume = isMuted ? 0 : 0.7;
  }, [isMuted]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    if (!id) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (id.startsWith('http') || id.startsWith('/')) { window.open(id, '_blank'); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Bagel+Fat+One&display=swap');
        .mojju-bagel { font-family: 'Bagel Fat One', cursive; }
        .mojju-glass {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(25px) saturate(1.5);
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .mojju-menu-panel {
          transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      ` }} />

      <div className="relative h-screen w-full overflow-hidden bg-black">

        {/* Video background */}
        {videoSrc ? (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay muted loop playsInline
            src={videoSrc}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-950" />
        )}

        {/* Fixed navbar */}
        <nav
          className="fixed top-0 left-0 right-0 w-full z-[110] transition-all duration-300"
          style={isScrolled ? { background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.1)' } : {}}
        >
          <div className="w-full px-6 sm:px-8 lg:px-12 py-4 flex items-center justify-between">

            {/* Logo */}
            <button onClick={() => scrollTo('')} className="shrink-0">
              {logoUrl
                ? <img src={logoUrl} alt="Logo" className="h-8 w-auto" />
                : <span className="mojju-bagel text-white text-xl tracking-wider">MOJJU</span>
              }
            </button>

            {/* Desktop links */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(item.href)}
                  className="text-white hover:text-white/80 font-medium transition-opacity cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              {/* Mute toggle */}
              <div className="relative">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="mojju-glass p-3 rounded-full text-white hover:bg-white/20 transition-all cursor-pointer"
                >
                  {isMuted
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                  }
                </button>
                {isMuted && (
                  <div className="absolute -bottom-10 right-0 flex items-center text-white/80 whitespace-nowrap pointer-events-none">
                    <span className="font-medium text-sm mr-1">Sound On</span>
                    <span className="text-lg">↗</span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={() => scrollTo('contact')}
                className="hidden sm:block bg-red-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-red-700 transition-colors ml-4 cursor-pointer"
              >
                {ctaText}
              </button>

              {/* Hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden mojju-glass p-3 rounded-full text-white hover:bg-white/20 transition-all cursor-pointer z-[120] relative"
              >
                {menuOpen
                  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                }
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile overlay */}
        {menuOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-[80] cursor-pointer"
            style={{ backdropFilter: 'blur(8px)' }}
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Mobile panel */}
        <div
          className="md:hidden fixed top-0 right-0 h-full w-72 max-w-[85vw] z-[90] mojju-menu-panel"
          style={{
            background: 'rgba(0,0,0,0.92)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full px-6 pt-6 pb-8">
            <div className="flex justify-end mb-6">
              <button onClick={() => setMenuOpen(false)} className="mojju-glass p-3 rounded-full text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="flex flex-col space-y-2 text-white flex-1">
              {navItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(item.href)}
                  className="px-4 py-3 text-left hover:bg-white/10 rounded-lg font-medium text-lg transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => { scrollTo('contact'); }}
              className="bg-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-700 transition-colors mt-8"
            >
              {ctaText}
            </button>
          </div>
        </div>

        {/* Hero title — bottom left */}
        <div className="absolute bottom-12 left-6 sm:left-8 lg:left-12 z-40">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight text-white"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            <span className="block">{line1}</span>
            <span className="block">{line2}</span>
            <span className="block">{line3}</span>
          </h1>
        </div>

      </div>
    </>
  );
}

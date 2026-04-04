'use client';
import { useState, useEffect, useRef } from 'react';

const DEFAULTS = [
  {
    id: 'aptanutri', label: 'Aptanutri',
    sublabel: 'Aptanutri Premium, Profutura e Soja',
    badge: '/assets/badge30-new.svg',
    bg: '/assets/extracted-bgAptanutri.webp',
    color: '#71bff3',
    product: '/assets/extracted-aptanutri.webp',
    productAlt: 'Aptanutri',
    imgClass: 'h-[85%] w-auto',
  },
  {
    id: 'fortini', label: 'Fortini',
    sublabel: 'Fortini Complete e Plus',
    badge: null, bg: null,
    color: '#602A68',
    panelGradient: 'linear-gradient(to right, #602A68 0%, #7A3D6E 5%, #E37F79 70%)',
    product: '/assets/extracted-fortini.svg',
    productAlt: 'Fortini',
    imgClass: 'h-[90%] w-auto',
  },
  {
    id: 'nutridrink', label: 'Nutridrink',
    sublabel: 'Nutridrink Protein e Protein Sênior',
    badge: null, bg: null,
    color: '#c55871',
    panelGradient: 'linear-gradient(to right, #c55871 0%, #E37F79 5%, #7A3D6E 100%)',
    product: '/assets/nutridrink-potes.svg',
    productAlt: 'Nutridrink Protein',
    imgClass: 'w-[90%] h-auto',
  },
  {
    id: 'neoforte', label: 'Neoforte',
    sublabel: 'Neoforte',
    badge: '/assets/badge30-new.svg',
    bg: '/assets/extracted-bgNeoforte.webp',
    color: '#FF6B7A',
    panelGradient: 'linear-gradient(to right, #FF6B7A 0%, #FF6B7A 5%, #602A68 100%)',
    product: '/assets/neoforte-potes.svg',
    productAlt: 'Neoforte',
    imgClass: 'h-[88%] w-auto',
  },
];

type ProductOverride = { id: string; label?: string; sublabel?: string; color?: string; imageUrl?: string };

function mergeProducts(overrides?: ProductOverride[]) {
  return DEFAULTS.map((def) => {
    const ov = overrides?.find((p) => p.id === def.id);
    const color = ov?.color ?? def.color;
    const colorChanged = ov?.color && ov.color !== def.color;
    return {
      ...def,
      label:        ov?.label    ?? def.label,
      sublabel:     ov?.sublabel ?? def.sublabel,
      color,
      // if color is overridden, drop the gradient so the solid color takes effect
      panelGradient: colorChanged ? undefined : (def as any).panelGradient,
      product:      ov?.imageUrl || def.product,
    };
  });
}

const BLUE = '#1a4fa3';
const R = 16;
const GAP = 8;
const MORPH_MS = 480;
const EASE_DRAG    = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const EASE_CONTENT = 'cubic-bezier(0.76, 0, 0.24, 1)';
const CONTAINER_H  = 640;

export function ProductsSection({ content }: { content?: { products?: ProductOverride[] } }) {
  const PRODUCTS = mergeProducts(content?.products);

  const [activeIdx, setActiveIdx]   = useState(0);
  const [morphDir, setMorphDir]     = useState(1);
  const [contentKey, setContentKey] = useState(0);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const itemRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const [sliderPos, setSliderPos]   = useState({ top: 0, height: 0 });

  const current = PRODUCTS[activeIdx];
  const isFirst = activeIdx === 0;
  const isLast  = activeIdx === PRODUCTS.length - 1;

  const updateSlider = (idx: number) => {
    const el = itemRefs.current[idx];
    const sb = sidebarRef.current;
    if (!el || !sb) return;
    const er = el.getBoundingClientRect();
    const sr = sb.getBoundingClientRect();
    setSliderPos({ top: er.top - sr.top, height: er.height });
  };

  useEffect(() => { updateSlider(activeIdx); }, [activeIdx]);
  useEffect(() => { setTimeout(() => updateSlider(0), 60); }, []);

  const handleSelect = (i: number) => {
    if (i === activeIdx) return;
    setMorphDir(i > activeIdx ? 1 : -1);
    setActiveIdx(i);
    setContentKey((k) => k + 1);
  };

  const anim = (delay = 0): React.CSSProperties => ({
    animation: `${morphDir > 0 ? 'morphInDown' : 'morphInUp'} ${MORPH_MS}ms ${EASE_CONTENT} ${delay}ms both`,
  });

  const panelBR = `${isFirst ? '0' : R}px 20px 20px ${isLast ? '0' : R}px`;

  return (
    <section id="produtos" className="w-full flex flex-col items-center justify-center px-4 md:px-6 py-10 md:py-14" style={{ fontFamily: "'Nunito',sans-serif" }}>
      <style>{`
        @keyframes morphInDown { from { opacity:0; transform:translateY(-32px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes morphInUp   { from { opacity:0; transform:translateY( 32px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes badgeIn     { from { opacity:0; transform:scale(0.8) translate(8px,-8px); } to { opacity:1; transform:scale(1) translate(0,0); } }
        @keyframes sublabelIn  { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* ── MOBILE ── */}
      <div className="lg:hidden w-full flex flex-col items-center">
        <p className="font-black text-lg text-[#1a2a4a] tracking-wider uppercase text-center mb-4">
          PRODUTOS PARTICIPANTES
        </p>

        <div className="flex w-full max-w-[560px] rounded-t-[16px] overflow-hidden" style={{ background: BLUE }}>
          {PRODUCTS.map((s, i) => (
            <button
              key={s.id + '-tab'}
              onClick={() => handleSelect(i)}
              className="flex-1 py-3 text-white text-xs font-bold tracking-wide uppercase"
              style={{ background: i === activeIdx ? current.color : 'transparent', transition: `background ${MORPH_MS}ms ease` }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div
          className="w-full max-w-[560px] relative rounded-b-[16px] overflow-hidden flex flex-col"
          style={{ minHeight: 500, background: (current as any).panelGradient ?? current.color, transition: `background ${MORPH_MS}ms ease` }}
        >
          {PRODUCTS.map((s) => (
            <div key={s.id + '-bg-m'} className="absolute inset-0"
              style={{ opacity: s.id === current.id ? 1 : 0, transition: `opacity ${MORPH_MS}ms ${EASE_CONTENT}`, zIndex: s.id === current.id ? 1 : 0 }}>
              {s.bg && <img src={s.bg} alt="" loading="lazy" className="w-full h-full object-cover" />}
            </div>
          ))}

          {current.badge && (
            <img key={'badge-m-' + contentKey} src={current.badge} alt="desconto"
              className="absolute top-2 right-2 h-20 sm:h-24 z-[4]"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.15))', animation: `badgeIn ${MORPH_MS}ms ${EASE_DRAG} both` }} />
          )}

          <div className="relative w-full flex-1 flex items-end justify-center z-10" style={{ pointerEvents: 'none', minHeight: 380 }}>
            <img
              key={'prod-m-' + contentKey}
              src={current.product}
              alt={current.productAlt}
              className={`object-contain mb-12 ${current.imgClass}`}
              style={{ maxHeight: '90%', ...anim(0) }}
            />
          </div>

          <div className="px-4 py-3 relative z-10 text-left" style={{ background: 'rgba(0,0,0,0.25)' }}>
            <p className="text-white font-extrabold text-lg leading-tight">{current.label}</p>
            <p className="text-white/90 text-sm font-semibold leading-snug mt-0.5">{current.sublabel}</p>
          </div>
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden lg:flex bg-[#f0f4f8] rounded-[32px] p-10 pb-8 w-full max-w-[1000px] flex-col items-center">
        <p className="font-black text-3xl text-[#1a2a4a] tracking-wider uppercase text-center mb-6 py-4">
          PRODUTOS PARTICIPANTES
        </p>

        <div className="w-full max-w-[900px]">
          <div
            className="flex rounded-[20px] relative"
            style={{ height: CONTAINER_H, overflow: 'visible', boxShadow: '0 20px 56px rgba(0,0,0,0.18)', background: BLUE }}
          >
            {/* ── SIDEBAR ── */}
            <div
              ref={sidebarRef}
              className="flex-shrink-0 flex flex-col relative rounded-l-[20px] overflow-hidden"
              style={{ width: 270, gap: GAP, zIndex: 6 }}
            >
              <div style={{
                position: 'absolute', left: 0, right: 0,
                top: sliderPos.top, height: sliderPos.height,
                background: current.color,
                transition: `top ${MORPH_MS}ms ${EASE_DRAG}, height ${MORPH_MS}ms ${EASE_DRAG}, background ${MORPH_MS}ms ease`,
                borderRadius: `${isFirst ? 20 : R}px 0 0 ${isLast ? 20 : R}px`,
                zIndex: 1, pointerEvents: 'none',
              }} />

              {!isFirst && (
                <div style={{ position: 'absolute', right: 0, top: sliderPos.top - R, width: R, height: R, transition: `top ${MORPH_MS}ms ${EASE_DRAG}`, zIndex: 2, pointerEvents: 'none', overflow: 'visible' }}>
                  <svg width={R} height={R} viewBox={`0 0 ${R} ${R}`} style={{ display: 'block', overflow: 'visible' }}>
                    <rect x="0" y="0" width={R} height={R} fill={current.color} style={{ transition: `fill ${MORPH_MS}ms ease` }} />
                    <circle cx="0" cy="0" r={R} fill={BLUE} />
                  </svg>
                </div>
              )}
              {!isLast && (
                <div style={{ position: 'absolute', right: 0, top: sliderPos.top + sliderPos.height, width: R, height: R, transition: `top ${MORPH_MS}ms ${EASE_DRAG}`, zIndex: 2, pointerEvents: 'none', overflow: 'visible' }}>
                  <svg width={R} height={R} viewBox={`0 0 ${R} ${R}`} style={{ display: 'block', overflow: 'visible' }}>
                    <rect x="0" y="0" width={R} height={R} fill={current.color} style={{ transition: `fill ${MORPH_MS}ms ease` }} />
                    <circle cx="0" cy={R} r={R} fill={BLUE} />
                  </svg>
                </div>
              )}

              <div style={{
                position: 'absolute', right: -1, top: sliderPos.top, height: sliderPos.height, width: 6,
                background: current.color,
                transition: `top ${MORPH_MS}ms ${EASE_DRAG}, height ${MORPH_MS}ms ${EASE_DRAG}, background ${MORPH_MS}ms ease`,
                zIndex: 5, pointerEvents: 'none',
              }} />

              {PRODUCTS.map((s, i) => (
                <div
                  key={s.id}
                  ref={(el) => { itemRefs.current[i] = el; }}
                  onClick={() => handleSelect(i)}
                  className="flex-1 relative flex flex-col justify-center pl-6 pr-3 select-none"
                  style={{ cursor: i === activeIdx ? 'default' : 'pointer', zIndex: 3 }}
                >
                  <p className="m-0 font-extrabold text-[28px] text-white leading-none">{s.label}</p>
                  {i === activeIdx && (
                    <p className="mt-1 text-[14px] text-white/90 font-semibold leading-snug" style={{ animation: 'sublabelIn 0.35s ease both' }}>
                      {s.sublabel}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* ── RIGHT PANEL ── */}
            <div
              className="flex-1 relative flex items-center justify-center"
              style={{
                borderRadius: panelBR,
                overflow: 'visible',
                background: (current as any).panelGradient ?? current.color,
                transition: `border-radius ${MORPH_MS}ms ${EASE_DRAG}, background ${MORPH_MS}ms ease`,
                zIndex: 5,
              }}
            >
              {PRODUCTS.map((s) => (
                <div key={s.id + '-bg'} className="absolute inset-0 overflow-hidden"
                  style={{ borderRadius: 'inherit', opacity: s.id === current.id ? 1 : 0, transition: `opacity ${MORPH_MS}ms ${EASE_CONTENT}`, zIndex: 1 }}>
                  {s.bg && <img src={s.bg} alt="" loading="lazy" className="w-full h-full object-cover" />}
                </div>
              ))}

              {current.badge && (
                <img key={'badge-' + contentKey} src={current.badge} alt="desconto"
                  className="absolute top-4 right-4 h-28 z-[4]"
                  style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.15))', animation: `badgeIn ${MORPH_MS}ms ${EASE_DRAG} both` }} />
              )}

              <div className="absolute inset-0 flex items-center justify-center z-[10]" style={{ overflow: 'visible', pointerEvents: 'none' }}>
                <img
                  key={'prod-' + contentKey}
                  src={current.product}
                  alt={current.productAlt}
                  className={`object-contain ${current.imgClass}`}
                  style={{ maxWidth: 'none', ...anim(0) }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

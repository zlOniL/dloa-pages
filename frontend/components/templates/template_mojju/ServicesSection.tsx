'use client';
import { useState } from 'react';

interface ServiceItem { title?: string; description?: string; image?: string }
interface ServicesContent {
  title?: string;
  subtitle?: string;
  items?: ServiceItem[];
}

const DEFAULT_ITEMS: ServiceItem[] = [
  { title: 'Campaign & Ad Content',  description: 'Multi-platform video campaigns ready for every channel—YouTube, TikTok, Instagram, and beyond.', image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop&auto=format' },
  { title: 'Brand Films & Stories',  description: 'Cinematic brand videos that capture your essence and connect with audiences on an emotional level.',    image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=300&fit=crop&auto=format' },
  { title: 'Trailers & Promos',      description: 'High-impact teasers that hook viewers instantly—perfect for launches, events, and announcements.',      image: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=300&fit=crop&auto=format' },
  { title: 'Short-Form Films',       description: 'Festival-ready mini-movies up to 5 minutes—ideal for investors, events, and premium content.',           image: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=300&fit=crop&auto=format' },
  { title: 'Animation & Motion',     description: 'Stylized animated content that explains complex ideas without needing live actors.',                     image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop&auto=format' },
  { title: 'Social Content',         description: 'Thumb-stopping vertical videos delivered in batches to keep your feed consistently engaging.',           image: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=400&h=300&fit=crop&auto=format' },
];

const ROTATIONS = ['rotate-2', '-rotate-1', 'rotate-1', '-rotate-2', 'rotate-3', '-rotate-1'];
const SWAYS     = ['photo-sway-1', 'photo-sway-2', 'photo-sway-3'];

export function ServicesSection({ content }: { content: ServicesContent }) {
  const {
    title    = 'What We Develop',
    subtitle = 'Developed with precision, delivered with passion',
    items    = DEFAULT_ITEMS,
  } = content ?? {};

  const [hovered, setHovered] = useState<number | null>(null);

  const row1 = items.slice(0, 3);
  const row2 = items.slice(3, 6);

  const Rope = () => (
    <div className="absolute top-8 left-0 right-0 h-4" style={{ animation: 'mojju-rope-sway 8s ease-in-out infinite' }}>
      <div className="w-full h-full rounded-full" style={{ background: 'linear-gradient(180deg, #92400e 0%, #78350f 50%, #92400e 100%)' }} />
      <div className="absolute top-0 left-0 right-0 h-2 rounded-full opacity-80" style={{ background: 'linear-gradient(90deg, transparent 0%, #d97706 50%, transparent 100%)' }} />
      <div className="absolute -bottom-3 left-0 right-0 h-4 rounded-full blur-xl" style={{ background: 'rgba(0,0,0,0.3)' }} />
    </div>
  );

  const Anchor = ({ side }: { side: 'left' | 'right' }) => (
    <div
      className={`absolute top-4 w-10 h-10 rounded-full shadow-xl border border-gray-400 ${side === 'left' ? 'left-0 sm:-left-10' : 'right-0 sm:-right-10'}`}
      style={{ background: 'linear-gradient(135deg, #9ca3af, #374151)' }}
    >
      <div className="absolute top-1.5 left-1.5 w-3 h-3 bg-gray-300 rounded-full opacity-80" />
    </div>
  );

  const Clothespin = () => (
    <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20">
      <div className="relative w-5 h-10">
        <div className="absolute left-0 top-0 w-2.5 h-10 rounded-l-md shadow-md" style={{ background: 'linear-gradient(90deg, #fef3c7, #fed7aa)', borderRight: '1px solid rgba(251,146,60,0.3)' }} />
        <div className="absolute right-0 top-0 w-2.5 h-10 rounded-r-md shadow-md" style={{ background: 'linear-gradient(270deg, #fef3c7, #fed7aa)', borderLeft: '1px solid rgba(251,146,60,0.3)' }} />
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-2 rounded-sm shadow-sm" style={{ background: 'linear-gradient(180deg, #d1d5db, #6b7280)' }} />
        <div className="absolute bottom-0 left-0 w-2.5 h-2 rounded-b-md" style={{ background: 'linear-gradient(180deg, #fed7aa, #fdba74)' }} />
        <div className="absolute bottom-0 right-0 w-2.5 h-2 rounded-b-md" style={{ background: 'linear-gradient(180deg, #fed7aa, #fdba74)' }} />
      </div>
    </div>
  );

  const PhotoCard = ({ item, index, globalIndex }: { item: ServiceItem; index: number; globalIndex: number }) => (
    <div
      className={`transform transition-all duration-700 relative ${ROTATIONS[globalIndex % ROTATIONS.length]}`}
      style={{ transform: hovered === globalIndex ? 'scale(1.05) translateY(-8px)' : '' }}
      onMouseEnter={() => setHovered(globalIndex)}
      onMouseLeave={() => setHovered(null)}
    >
      <Clothespin />
      <div
        className="relative bg-white p-4 pb-8 shadow-2xl cursor-pointer w-[260px] sm:w-[280px] max-w-[90vw]"
        style={{
          filter: hovered === globalIndex ? 'brightness(1.1) contrast(1.05)' : 'brightness(1) contrast(0.95)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 8px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}
      >
        {/* Image */}
        <div className="h-48 mb-6 rounded-sm relative overflow-hidden bg-gray-200">
          {item.image && (
            <img
              src={item.image}
              alt={item.title ?? ''}
              className="w-full h-full object-cover rounded-sm"
              style={{ filter: 'sepia(15%) saturate(85%) brightness(90%) contrast(1.1)' }}
            />
          )}
          <div className="absolute inset-0 rounded-sm" style={{ background: 'rgba(127,29,29,0.05)' }} />
        </div>

        <h3 className="font-black text-lg text-gray-800 mb-3 leading-tight">{item.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>

        {/* Stamp */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 font-mono opacity-60">MOJJU LAB</div>
      </div>
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes mojju-rope-sway { 0%,100% { transform: translateY(0); } 50% { transform: translateY(3px); } }
        @keyframes mojju-photo-sway1 { 0%,100% { transform: rotate(2deg) translateY(0); } 50% { transform: rotate(2.5deg) translateY(-4px); } }
        @keyframes mojju-photo-sway2 { 0%,100% { transform: rotate(-1deg) translateY(0); } 50% { transform: rotate(-1.5deg) translateY(-3px); } }
        @keyframes mojju-photo-sway3 { 0%,100% { transform: rotate(1deg) translateY(0); } 50% { transform: rotate(0.5deg) translateY(-5px); } }
      ` }} />

      <section id="services" className="relative py-20 overflow-visible w-full" style={{ background: 'linear-gradient(135deg, #2d1810 0%, #1a0f08 30%, #0f0704 60%, #1a0f08 100%)' }}>

        {/* Darkroom bg effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(127,29,29,0.2)' }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-2xl" style={{ background: 'rgba(120,53,15,0.15)' }} />
        </div>

        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10 max-w-7xl overflow-visible">

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-amber-200/80">Fresh from the Darkroom</span>
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
            </div>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6 text-amber-100">{title}</h2>
            <p className="text-xl text-amber-200/90 leading-relaxed max-w-3xl mx-auto">{subtitle}</p>
          </div>

          {/* Row 1 */}
          <div className="relative mb-24 overflow-visible">
            <Rope />
            <Anchor side="left" />
            <Anchor side="right" />
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 lg:gap-16 pt-20 overflow-visible">
              {row1.map((item, i) => (
                <PhotoCard key={i} item={item} index={i} globalIndex={i} />
              ))}
            </div>
          </div>

          {/* Row 2 */}
          <div className="relative overflow-visible">
            <Rope />
            <Anchor side="left" />
            <Anchor side="right" />
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 lg:gap-16 pt-20 overflow-visible">
              {row2.map((item, i) => (
                <PhotoCard key={i} item={item} index={i} globalIndex={i + 3} />
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-sm text-amber-200/70 leading-relaxed max-w-2xl mx-auto">
              Each piece is carefully developed in our creative darkroom, ensuring every detail captures the essence of your vision with precision and artistic flair.
            </p>
          </div>

        </div>
      </section>
    </>
  );
}

'use client';
import { useState, useEffect } from 'react';

interface ProcessStep { number?: string; title?: string; description?: string }
interface AboutContent {
  title?: string;
  subtitle?: string;
  steps?: ProcessStep[];
  _images?: { storyboard?: string };
}

const COLORS = ['#2563eb', '#059669', '#7c3aed', '#2563eb', '#7c3aed'];

const DEFAULT_STEPS: ProcessStep[] = [
  { number: '01', title: 'Concept & Script',   description: 'Scene-by-scene draft with dialogues and time-codes' },
  { number: '02', title: 'Look & Storyboard',  description: 'AI engine selection and visual testing' },
  { number: '03', title: 'AI Production',       description: 'Motion tests and multi-variant generation' },
  { number: '04', title: 'Post-production',     description: 'VFX, color grading, and audio mixing' },
  { number: '05', title: 'Master Delivery',     description: 'Multi-format export and secure transfer' },
];

export function AboutSection({ content }: { content: AboutContent }) {
  const {
    title    = 'How We Create Magic',
    subtitle = 'Watch our process unfold frame by frame',
    steps    = DEFAULT_STEPS,
    _images  = {},
  } = content ?? {};

  const [activeFrame, setActiveFrame]       = useState(-1);
  const [animationStarted, setAnimation]    = useState(false);
  const storyboardSrc                       = _images?.storyboard;

  useEffect(() => {
    const t = setTimeout(() => {
      setAnimation(true);
      steps.forEach((_, i) => {
        setTimeout(() => setActiveFrame(i), i * 2000 + 1000);
      });
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes mojju-film-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes mojju-perfs-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .mojju-film-scroll   { animation: mojju-film-scroll 28s linear infinite; }
        .mojju-perfs-scroll  { animation: mojju-perfs-scroll 28s linear infinite; }
      ` }} />

      <section id="about" className="relative py-20 bg-white overflow-hidden w-full">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl relative z-10">

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#059669' }} />
              <span className="text-sm font-semibold text-gray-500">Behind the Scenes</span>
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#2563eb' }} />
            </div>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6 text-gray-900">{title}</h2>
            <p className="text-xl text-gray-500 leading-relaxed max-w-3xl mx-auto">{subtitle}</p>
          </div>

          {/* Film strip */}
          <div className="relative max-w-full mx-auto">
            <div
              className="relative rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(90deg, #030712 0%, #111827 50%, #030712 100%)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.05)',
              }}
            >
              {/* Perforations top */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-black z-20 overflow-hidden">
                <div className={`flex items-center justify-between px-12 h-full ${animationStarted ? 'mojju-perfs-scroll' : ''}`} style={{ width: '200%' }}>
                  {[...Array(40)].map((_, i) => (
                    <div key={i} className="w-4 h-3 bg-gray-800 rounded-sm border border-gray-700 flex-shrink-0" style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)' }} />
                  ))}
                </div>
              </div>

              {/* Perforations bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-black z-20 overflow-hidden">
                <div className={`flex items-center justify-between px-12 h-full ${animationStarted ? 'mojju-perfs-scroll' : ''}`} style={{ width: '200%' }}>
                  {[...Array(40)].map((_, i) => (
                    <div key={i} className="w-4 h-3 bg-gray-800 rounded-sm border border-gray-700 flex-shrink-0" style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)' }} />
                  ))}
                </div>
              </div>

              {/* Frames */}
              <div className="relative py-6 px-8 overflow-hidden h-64">
                <div className={`flex ${animationStarted ? 'mojju-film-scroll' : ''}`} style={{ width: 'max-content', gap: '32px' }}>

                  {/* Render twice for seamless loop */}
                  {[0, 1].map((pass) => (
                    <div key={pass} className="flex" style={{ gap: '32px' }}>
                      {/* START */}
                      <div className="flex-shrink-0 w-80 h-52 bg-gray-800 rounded-lg border-2 border-gray-700 opacity-60 flex items-center justify-center">
                        <span className="text-gray-400 font-mono tracking-wider">● START</span>
                      </div>

                      {steps.map((step, index) => (
                        <div
                          key={`${pass}-${index}`}
                          className="flex-shrink-0 w-80 h-52 bg-white rounded-lg border-4 transition-colors duration-700"
                          style={{
                            borderColor: activeFrame >= index ? COLORS[index % COLORS.length] : '#4b5563',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                          }}
                        >
                          <div className="relative h-full p-6 flex flex-col justify-between">
                            <div
                              className="absolute -top-4 -left-4 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-black z-10 text-lg border-2 border-white"
                              style={{ boxShadow: '0 6px 12px rgba(0,0,0,0.4)' }}
                            >
                              {step.number ?? String(index + 1).padStart(2, '0')}
                            </div>
                            <div>
                              <h3 className="font-black text-xl leading-tight mb-4 text-gray-900">{step.title}</h3>
                              <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                            </div>
                            {/* Frame edge lines */}
                            <div className="absolute left-1 top-1 bottom-1 w-px bg-gray-300/20" />
                            <div className="absolute right-1 top-1 bottom-1 w-px bg-gray-300/20" />
                            <div className="absolute top-1 left-1 right-1 h-px bg-gray-300/20" />
                            <div className="absolute bottom-1 left-1 right-1 h-px bg-gray-300/20" />
                          </div>
                        </div>
                      ))}

                      {/* END */}
                      <div className="flex-shrink-0 w-80 h-52 bg-gray-800 rounded-lg border-2 border-gray-700 opacity-60 flex items-center justify-center">
                        <span className="text-gray-400 font-mono tracking-wider">● END</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-12 text-center">
            <div
              className="inline-flex items-center gap-6 rounded-2xl px-8 py-4"
              style={{ background: 'rgba(249,250,251,0.8)', border: '1px solid #e5e7eb', backdropFilter: 'blur(8px)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
            >
              {[
                { dot: '#059669', label: '24 FPS' },
                { dot: '#2563eb', label: '5-7 Days' },
                { dot: '#7c3aed', label: 'Cinema Quality' },
              ].map(({ dot, label }, i) => (
                <div key={i} className="flex items-center gap-3">
                  {i > 0 && <div className="w-px h-6 bg-gray-200" />}
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: dot }} />
                  <span className="text-sm font-semibold text-gray-800">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Storyboard image */}
          {storyboardSrc && (
            <div className="mt-20">
              <div className="text-center mb-8">
                <p className="text-gray-500">A glimpse into our storyboard development process</p>
              </div>
              <div className="relative max-w-6xl mx-auto">
                <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-4 overflow-hidden">
                  <img
                    src={storyboardSrc}
                    alt="Storyboard"
                    className="w-full h-auto rounded-xl"
                    style={{ filter: 'contrast(1.05) saturate(1.1) brightness(0.95)' }}
                  />
                </div>
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-400 italic">"Diverse scenarios, characters, and styles — all generated through our AI pipeline"</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>
    </>
  );
}

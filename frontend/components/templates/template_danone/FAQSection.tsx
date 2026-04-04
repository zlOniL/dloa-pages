'use client';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

function FAQItemComponent({ question, answer, isOpen, onToggle }: FAQItem & { isOpen: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-full text-left rounded-[16px] shadow-sm transition-all duration-300 ease-in-out p-5 md:p-6"
      style={isOpen
        ? { backgroundColor: 'var(--color-secondary)', borderColor: 'var(--color-secondary)', border: '1px solid' }
        : { backgroundColor: 'white', border: '1px solid #E0E0E0' }
      }
      aria-expanded={isOpen}
    >
      <div className="flex justify-between items-start">
        <span className="text-base md:text-lg font-bold flex-1 pr-4 transition-colors duration-300"
          style={{ color: isOpen ? 'white' : 'var(--color-secondary)' }}>
          {question}
        </span>
        <span className="shrink-0 text-sm mt-1 transition-colors duration-300"
          style={{ color: isOpen ? 'white' : 'var(--color-secondary)' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </div>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}`}>
        <div className="text-white text-sm md:text-base leading-relaxed">{answer}</div>
      </div>
    </button>
  );
}

export function FAQSection({ content }: { content: { title?: string; items: FAQItem[] } }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="duvidas" className="w-full pt-16 pb-8 bg-white">
      <div className="max-w-[1400px] mx-auto px-5">
        <h2 className="text-[#2C3A64] text-center text-3xl md:text-[46px] font-extrabold mb-12 uppercase">
          {content.title ?? 'Dúvidas'}
        </h2>
        <div className="flex flex-col gap-4 max-w-[900px] mx-auto">
          {content.items.map((item, index) => (
            <FAQItemComponent
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

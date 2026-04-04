export interface SectionDef {
  type: string;
  order: number;
  enabled: boolean;
  content: Record<string, any>;
}

export interface TemplateStructure {
  sections: SectionDef[];
}

export const TEMPLATE_REGISTRY: Record<string, TemplateStructure> = {
  'template-mojju': {
    sections: [
      { type: 'hero',      order: 1, enabled: true, content: { line1: 'AI FILM', line2: 'PRODUCTION', line3: 'WITHOUT LIMITS', ctaText: 'Book a Call' } },
      { type: 'portfolio', order: 2, enabled: true, content: { embedUrl: 'https://www.youtube.com/embed/fIbDWDh6aYw?rel=0&showinfo=0&modestbranding=1', projectTitle: 'The Lonely Journey', projectDescription: 'A powerful commercial exploring the isolation that startup founders face and how joining the community can transform that journey.', industry: 'Community Platform', style: 'Narrative Drama', tone: 'Emotional Journey', format: 'Digital Commercial' } },
      { type: 'about',     order: 3, enabled: true, content: { title: 'How We Create Magic', subtitle: 'Watch our process unfold frame by frame', steps: [{ number: '01', title: 'Concept & Script', description: 'Scene-by-scene draft with dialogues and time-codes' }, { number: '02', title: 'Look & Storyboard', description: 'AI engine selection and visual testing' }, { number: '03', title: 'AI Production', description: 'Motion tests and multi-variant generation' }, { number: '04', title: 'Post-production', description: 'VFX, color grading, and audio mixing' }, { number: '05', title: 'Master Delivery', description: 'Multi-format export and secure transfer' }] } },
      { type: 'services',  order: 4, enabled: true, content: { title: 'What We Develop', subtitle: 'Developed with precision, delivered with passion', items: [{ title: 'Campaign & Ad Content', description: 'Multi-platform video campaigns ready for every channel—YouTube, TikTok, Instagram, and beyond.', image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop&auto=format' }, { title: 'Brand Films & Stories', description: 'Cinematic brand videos that capture your essence and connect with audiences on an emotional level.', image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=300&fit=crop&auto=format' }, { title: 'Trailers & Promos', description: 'High-impact teasers that hook viewers instantly—perfect for launches, events, and announcements.', image: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=300&fit=crop&auto=format' }, { title: 'Short-Form Films', description: 'Festival-ready mini-movies up to 5 minutes—ideal for investors, events, and premium content.', image: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=300&fit=crop&auto=format' }, { title: 'Animation & Motion', description: 'Stylized animated content that explains complex ideas without needing live actors.', image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop&auto=format' }, { title: 'Social Content', description: 'Thumb-stopping vertical videos delivered in batches to keep your feed consistently engaging.', image: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=400&h=300&fit=crop&auto=format' }] } },
      { type: 'contact',   order: 5, enabled: true, content: { title: 'Ready to Light Up the Screen?', subtitle: "Tell us about your project and we'll get back to you with a plan to bring your vision to cinematic reality" } },
    ],
  },
  'template-danone': {
    sections: [
      { type: 'hero',         order: 1, enabled: true,  content: { title: 'Participe do programa de desconto', subtitle: 'Faça a sua primeira compra com <strong>condições especiais</strong>.', ctaText: 'Quero participar', ctaTarget: 'produtos' } },
      { type: 'about',        order: 2, enabled: true,  content: {} },
      { type: 'products',     order: 3, enabled: true,  content: {} },
      { type: 'how-it-works', order: 4, enabled: true,  content: {} },
      { type: 'pharmacy',     order: 5, enabled: true,  content: { title: 'Encontre a farmácia mais próxima de você' } },
      { type: 'partners',     order: 6, enabled: true,  content: {} },
      { type: 'faq',          order: 7, enabled: true,  content: { title: 'Dúvidas', items: [{ question: 'Como funciona?', answer: 'Cadastre-se com seu CPF e apresente o cupom na farmácia parceira.' }] } },
    ],
  },
};

export function getTemplateStructure(key: string): TemplateStructure | null {
  return TEMPLATE_REGISTRY[key] ?? null;
}

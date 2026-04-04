import { sectionsMap as danoneMap } from './template_danone/sectionsMap';
import { Footer as DanoneFooter }   from './template_danone/Footer';
import { schemas as danoneSchemas } from './template_danone/schemas';
import { sectionsMap as mojjuMap }  from './template_mojju/sectionsMap';
import { Footer as MojjuFooter }    from './template_mojju/Footer';
import { schemas as mojjuSchemas }  from './template_mojju/schemas';

// ── Template registry ────────────────────────────────────────────────────────
// Para adicionar um novo template, basta criar sua pasta em templates/template_xyz/
// com sectionsMap.tsx, Footer.tsx e schemas.ts — e adicionar uma entrada aqui.

export type NavItem = { label: string; href: string };

interface TemplateEntry {
  sectionsMap: Record<string, React.ComponentType<{ content: any; slug?: string }>>;
  Footer: React.ComponentType<{ footerLogoUrl?: string; navItems?: NavItem[]; footerLinks?: any[] }>;
  schemas: Record<string, any>;
  // Logos — string vazia significa que o template usa texto/SVG embutido como fallback
  defaultLogoSrc: string;
  defaultFooterLogoSrc: string;
  // Nav
  defaultNavItems: NavItem[];
  // Footer links — false = o footer deste template não usa links editáveis
  hasFooterLinks: boolean;
  footerLinksLabel: string;
  defaultFooterLinks: NavItem[];
}

const REGISTRY: Record<string, TemplateEntry> = {
  'template-danone': {
    sectionsMap:          danoneMap,
    Footer:               DanoneFooter,
    schemas:              danoneSchemas,
    defaultLogoSrc:       '/assets/header-logo.svg',
    defaultFooterLogoSrc: '/assets/logo-meu-cupom-danone.webp',
    hasFooterLinks:       true,
    footerLinksLabel:     '🔗 Links do rodapé',
    defaultNavItems: [
      { label: 'Início',        href: '' },
      { label: 'Produtos',      href: 'produtos' },
      { label: 'Sobre nós',     href: 'sobre' },
      { label: 'Como funciona', href: 'como-funciona' },
      { label: 'Dúvidas',       href: 'duvidas' },
    ],
    defaultFooterLinks: [
      { label: 'Início',        href: '' },
      { label: 'Sobre nós',     href: 'sobre' },
      { label: 'Como funciona', href: 'como-funciona' },
      { label: 'Dúvidas',       href: 'duvidas' },
    ],
  },

  'template-mojju': {
    sectionsMap:          mojjuMap,
    Footer:               MojjuFooter,
    schemas:              mojjuSchemas,
    defaultLogoSrc:       '',   // usa texto "MOJJU" como fallback
    defaultFooterLogoSrc: '',   // footer não exibe logo por padrão
    hasFooterLinks:       true,
    footerLinksLabel:     '🛠 Ferramentas (Tools We Use)',
    defaultNavItems: [
      { label: 'Work',         href: 'portfolio' },
      { label: 'Process',      href: 'about' },
      { label: 'Capabilities', href: 'services' },
      { label: 'Contact',      href: 'contact' },
    ],
    defaultFooterLinks: [
      { label: 'Runway Gen-4',     href: 'https://runwayml.com' },
      { label: 'Kling 2',          href: 'https://klingai.com' },
      { label: 'Veo 3',            href: 'https://deepmind.google/models/veo' },
      { label: 'Higgsfield AI',    href: 'https://higgsfield.ai' },
      { label: 'Hailuo Minimax 2', href: 'https://hailuoai.com' },
      { label: 'Midjourney',       href: 'https://midjourney.com' },
      { label: 'Leonardo AI',      href: 'https://leonardo.ai' },
      { label: 'Krea AI',          href: 'https://krea.ai' },
      { label: 'Suno AI',          href: 'https://suno.com' },
      { label: 'ElevenLabs',       href: 'https://elevenlabs.io' },
    ],
  },
};

const FALLBACK = 'template-danone';

export function getTemplate(key?: string | null): TemplateEntry {
  return REGISTRY[key ?? FALLBACK] ?? REGISTRY[FALLBACK];
}

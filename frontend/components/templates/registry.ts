import { sectionsMap as danoneMap } from './template_danone/sectionsMap';
import { Footer as DanoneFooter }   from './template_danone/Footer';
import { schemas as danoneSchemas } from './template_danone/schemas';
import { sectionsMap as mojjuMap }  from './template_mojju/sectionsMap';
import { Footer as MojjuFooter }    from './template_mojju/Footer';
import { schemas as mojjuSchemas }  from './template_mojju/schemas';

// ── Template registry ────────────────────────────────────────────────────────
// Para adicionar um novo template, basta criar sua pasta em templates/template_xyz/
// com sectionsMap.tsx, Footer.tsx e schemas.ts — e adicionar uma entrada aqui.

const REGISTRY: Record<string, {
  sectionsMap: Record<string, React.ComponentType<{ content: any; slug?: string }>>;
  Footer: React.ComponentType<{ footerLogoUrl?: string; footerLinks?: any[] }>;
  schemas: Record<string, any>;
}> = {
  'template-danone': {
    sectionsMap: danoneMap,
    Footer:      DanoneFooter,
    schemas:     danoneSchemas,
  },
  'template-mojju': {
    sectionsMap: mojjuMap,
    Footer:      MojjuFooter,
    schemas:     mojjuSchemas,
  },
};

const FALLBACK = 'template-danone';

export function getTemplate(key?: string | null) {
  return REGISTRY[key ?? FALLBACK] ?? REGISTRY[FALLBACK];
}

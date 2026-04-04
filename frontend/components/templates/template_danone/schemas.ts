export type {
  SimpleField, ArrayField, ProductsField, ProductEntry,
  FieldDef, ColorDef, ImageDef, VideoDef, SectionSchema,
} from '../types';

import type { SectionSchema } from '../types';

export const schemas: Record<string, SectionSchema> = {
  hero: {
    colors: [
      { key: 'primary',   label: 'Cor de fundo' },
      { key: 'secondary', label: 'Cor do botão' },
    ],
    fields: [
      { key: 'title',     label: 'Título',                       type: 'text' },
      { key: 'subtitle',  label: 'Subtítulo (suporta HTML)',      type: 'textarea' },
      { key: 'ctaText',   label: 'Texto do botão',                type: 'text' },
      { key: 'ctaTarget', label: 'Link do botão (âncora ou URL)', type: 'text' },
    ],
    images: [
      { key: 'desktopProducts', label: 'Imagem produtos (desktop)', defaultSrc: '/assets/hero-products.png' },
      { key: 'mobileProducts',  label: 'Imagem produtos (mobile)',  defaultSrc: '/assets/hero-products-mobile.png' },
    ],
  },
  'how-it-works': {
    colors: [{ key: 'primary', label: 'Cor de fundo' }],
    fields: [],
    images: [
      { key: 'steps', label: 'Imagem dos passos', defaultSrc: '/assets/como-funciona-steps.svg' },
    ],
  },
  pharmacy: {
    colors: [
      { key: 'primary',   label: 'Cor de fundo' },
      { key: 'secondary', label: 'Cor do botão de busca' },
    ],
    fields: [{ key: 'title', label: 'Título', type: 'text' }],
    images: [],
  },
  faq: {
    colors: [{ key: 'secondary', label: 'Cor ativa do acordeão' }],
    fields: [
      { key: 'title', label: 'Título', type: 'text' },
      {
        key: 'items', label: 'Perguntas & Respostas', type: 'array',
        itemFields: [
          { key: 'question', label: 'Pergunta',  type: 'text' },
          { key: 'answer',   label: 'Resposta',  type: 'textarea' },
        ],
      },
    ],
    images: [],
  },
  about:    { colors: [], fields: [], images: [{ key: 'banner', label: 'Banner', defaultSrc: '/assets/about-banner.png' }] },
  products: {
    colors: [],
    images: [],
    fields: [{
      key: 'products', label: 'Produtos', type: 'products-list',
      productDefaults: [
        { id: 'aptanutri',  label: 'Aptanutri',  sublabel: 'Aptanutri Premium, Profutura e Soja', color: '#71bff3', imageUrl: '', defaultImageSrc: '/assets/extracted-aptanutri.webp' },
        { id: 'fortini',    label: 'Fortini',    sublabel: 'Fortini Complete e Plus',              color: '#602A68', imageUrl: '', defaultImageSrc: '/assets/extracted-fortini.svg' },
        { id: 'nutridrink', label: 'Nutridrink', sublabel: 'Nutridrink Protein e Protein Sênior',  color: '#c55871', imageUrl: '', defaultImageSrc: '/assets/nutridrink-potes.svg' },
        { id: 'neoforte',   label: 'Neoforte',   sublabel: 'Neoforte',                             color: '#FF6B7A', imageUrl: '', defaultImageSrc: '/assets/neoforte-potes.svg' },
      ],
    }],
  },
  partners: { colors: [], fields: [], images: [{ key: 'strip', label: 'Faixa de parceiros', defaultSrc: '/assets/partners-strip.svg' }] },
};

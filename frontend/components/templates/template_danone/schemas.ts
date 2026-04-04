export type SimpleField   = { key: string; label: string; type: 'text' | 'textarea' };
export type ArrayField    = { key: string; label: string; type: 'array'; itemFields: SimpleField[] };
export type ProductsField = { key: string; label: string; type: 'products-list' };
export type FieldDef      = SimpleField | ArrayField | ProductsField;
export type ColorDef      = { key: 'primary' | 'secondary'; label: string };
export type ImageDef      = { key: string; label: string; defaultSrc: string };
export type VideoDef      = { key: string; label: string };
export type SectionSchema = { colors: ColorDef[]; fields: FieldDef[]; images: ImageDef[]; videos?: VideoDef[] };

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
    fields: [
      { key: 'title', label: 'Título', type: 'text' },
    ],
    images: [],
  },
  faq: {
    colors: [{ key: 'secondary', label: 'Cor ativa do acordeão' }],
    fields: [
      { key: 'title', label: 'Título', type: 'text' },
      {
        key: 'items', label: 'Perguntas & Respostas', type: 'array',
        itemFields: [
          { key: 'question', label: 'Pergunta', type: 'text' },
          { key: 'answer',   label: 'Resposta',  type: 'textarea' },
        ],
      },
    ],
    images: [],
  },
  about:    { colors: [], fields: [], images: [{ key: 'banner', label: 'Banner', defaultSrc: '/assets/about-banner.png' }] },
  products: { colors: [], images: [], fields: [{ key: 'products', label: 'Produtos', type: 'products-list' }] },
  partners: { colors: [], fields: [], images: [{ key: 'strip', label: 'Faixa de parceiros', defaultSrc: '/assets/partners-strip.svg' }] },
};

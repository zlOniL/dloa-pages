import type { SectionSchema } from '../template_danone/schemas';

export const schemas: Record<string, SectionSchema> = {
  hero: {
    colors: [],
    fields: [
      { key: 'line1',   label: 'Título — linha 1', type: 'text' },
      { key: 'line2',   label: 'Título — linha 2', type: 'text' },
      { key: 'line3',   label: 'Título — linha 3', type: 'text' },
      { key: 'ctaText', label: 'Texto do botão CTA', type: 'text' },
    ],
    images: [],
    videos: [
      { key: 'backgroundVideo', label: 'Vídeo de fundo (autoplay)' },
    ],
  },
  portfolio: {
    colors: [],
    fields: [
      { key: 'embedUrl',           label: 'URL do embed (YouTube ou Vimeo)', type: 'text' },
      { key: 'projectTitle',       label: 'Título do projeto',               type: 'text' },
      { key: 'projectDescription', label: 'Descrição do projeto',            type: 'textarea' },
      { key: 'industry',           label: 'Indústria',                       type: 'text' },
      { key: 'style',              label: 'Estilo',                          type: 'text' },
      { key: 'tone',               label: 'Tom',                             type: 'text' },
      { key: 'format',             label: 'Formato',                         type: 'text' },
    ],
    images: [],
  },
  about: {
    colors: [],
    fields: [
      { key: 'title',    label: 'Título',    type: 'text' },
      { key: 'subtitle', label: 'Subtítulo', type: 'text' },
      {
        key: 'steps', label: 'Etapas do processo', type: 'array',
        itemFields: [
          { key: 'number',      label: 'Número (ex: 01)',  type: 'text' },
          { key: 'title',       label: 'Título da etapa',  type: 'text' },
          { key: 'description', label: 'Descrição',        type: 'textarea' },
        ],
      },
    ],
    images: [
      { key: 'storyboard', label: 'Imagem do storyboard (opcional)', defaultSrc: '' },
    ],
  },
  services: {
    colors: [],
    fields: [
      { key: 'title',    label: 'Título da seção', type: 'text' },
      { key: 'subtitle', label: 'Subtítulo',        type: 'text' },
      {
        key: 'items', label: 'Serviços (até 6)', type: 'array',
        itemFields: [
          { key: 'title',       label: 'Título',           type: 'text' },
          { key: 'description', label: 'Descrição',        type: 'textarea' },
          { key: 'image',       label: 'URL da imagem',    type: 'text' },
        ],
      },
    ],
    images: [],
  },
  contact: {
    colors: [],
    fields: [
      { key: 'title',    label: 'Título',    type: 'text' },
      { key: 'subtitle', label: 'Subtítulo', type: 'textarea' },
    ],
    images: [],
  },
};

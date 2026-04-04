import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DANONE_SECTIONS = [
  { type: 'hero',         order: 1, enabled: true,  content: { title: 'Participe do programa oficial de desconto da Danone', subtitle: 'Faça a sua primeira compra com condições especiais pelo <strong>Meu Cupom Danone</strong>.', ctaText: 'Quero participar', ctaTarget: 'produtos' } },
  { type: 'about',        order: 2, enabled: true,  content: {} },
  { type: 'products',     order: 3, enabled: true,  content: {} },
  { type: 'how-it-works', order: 4, enabled: true,  content: {} },
  { type: 'pharmacy',     order: 5, enabled: true,  content: { title: 'Encontre a farmácia mais próxima de você' } },
  { type: 'partners',     order: 6, enabled: true,  content: {} },
  { type: 'faq',          order: 7, enabled: true,  content: { title: 'Dúvidas', items: [
    { question: 'Até quando a promoção é válida?', answer: 'Promoção válida até 31 de dezembro de 2026 ou enquanto durarem os estoques.' },
    { question: 'Quem pode usar o cupom?', answer: 'Cada CPF terá direito a um desconto por marca, válido para a compra de uma única lata de produto participante.' },
    { question: 'Quais produtos participam da promoção?', answer: 'Aptanutri Premium, Profutura e Soja (800g). Fortini Complete e Plus (400g e 800g). Nutridrink Protein (350g e 700g). Neoforte (400g).' },
    { question: 'Como posso entrar em contato em caso de dúvida?', answer: 'Em caso de dúvidas, entre em contato: dac@danone.com / 0800 7017561 - Segunda a sexta das 8h às 17h.' },
  ]} },
];

async function main() {
  // ── Limpar tudo em ordem ───────────────────────────────────────────────────
  await prisma.asset.deleteMany();
  await prisma.section.deleteMany();
  await prisma.site.deleteMany();
  await prisma.clientTemplate.deleteMany();
  await prisma.template.deleteMany();
  await prisma.client.deleteMany();

  // ── Template único (raw SQL — Prisma client pode estar desatualizado) ──────
  type TemplateRow = { id: string };

  const [templateDanone] = await prisma.$queryRaw<TemplateRow[]>`
    INSERT INTO "Template" (id, key, name, "previewUrl", "defaultConfig", "createdAt")
    VALUES (
      gen_random_uuid(),
      'template-danone',
      'Template Danone',
      '/assets/preview-template-danone.png',
      '{"colorPrimary":"#2C3A64","colorSecondary":"#C81244","fontFamily":"Nunito, sans-serif","logoUrl":"/assets/header-logo.svg","footerLogoUrl":"/assets/logo-meu-cupom-danone.webp"}'::jsonb,
      now()
    )
    RETURNING id
  `;

  // ── Clientes ───────────────────────────────────────────────────────────────
  const clientDanone = await prisma.client.create({
    data: { name: 'Danone Brasil', cnpj: '12.345.678/0001-90', slug: 'danone' },
  });

  const clientNestle = await prisma.client.create({
    data: { name: 'Nestlé Brasil', cnpj: '98.765.432/0001-10', slug: 'nestle' },
  });

  const clientUnilever = await prisma.client.create({
    data: { name: 'Unilever Brasil', cnpj: '45.678.901/0001-55', slug: 'unilever' },
  });

  // ── Sites Danone ───────────────────────────────────────────────────────────
  await prisma.site.create({
    data: {
      slug:        'cliente-a',
      siteSlug:    'meu-cupom-danone',
      clientId:    clientDanone.id,
      templateId:  templateDanone.id,
      companyName: 'Meu Cupom Danone',
      designTokens: {
        colorPrimary:   '#2C3A64',
        colorSecondary: '#C81244',
        fontFamily:     'Nunito, sans-serif',
        logoUrl:        '/assets/header-logo.svg',
        footerLogoUrl:  '/assets/logo-meu-cupom-danone.webp',
      },
      sections: { create: DANONE_SECTIONS },
    },
  });

  await prisma.site.create({
    data: {
      slug:        'cliente-b',
      siteSlug:    'danone-saude',
      clientId:    clientDanone.id,
      templateId:  templateDanone.id,
      companyName: 'Danone Saúde',
      designTokens: {
        colorPrimary:   '#7c3aed',
        colorSecondary: '#1a4fa3',
        fontFamily:     'Nunito, sans-serif',
        logoUrl:        '/assets/header-logo.svg',
        footerLogoUrl:  '/assets/logo-meu-cupom-danone.webp',
      },
      sections: {
        create: [
          { type: 'hero',         order: 1, enabled: true,  content: { title: 'Nutrição especial para toda a família Danone', subtitle: 'Descubra os produtos com <strong>descontos exclusivos</strong> para você.', ctaText: 'Quero participar', ctaTarget: 'produtos' } },
          { type: 'about',        order: 2, enabled: false, content: {} },
          { type: 'products',     order: 3, enabled: true,  content: {} },
          { type: 'how-it-works', order: 4, enabled: true,  content: {} },
          { type: 'pharmacy',     order: 5, enabled: false, content: { title: 'Encontre a farmácia mais próxima de você' } },
          { type: 'partners',     order: 6, enabled: false, content: {} },
          { type: 'faq',          order: 7, enabled: true,  content: { title: 'Perguntas Frequentes', items: [
            { question: 'Como funciona o desconto?', answer: 'Você se cadastra com seu CPF, recebe um cupom e apresenta na farmácia parceira no momento da compra.' },
            { question: 'Quais farmácias participam?', answer: 'Redes como Droga Raia, Drogasil, Pague Menos, Nissei, Panvel e muitas outras.' },
          ]} },
        ],
      },
    },
  });

  // ── Site Nestlé ────────────────────────────────────────────────────────────
  await prisma.site.create({
    data: {
      slug:        'nestle-beneficios',
      siteSlug:    'beneficios',
      clientId:    clientNestle.id,
      templateId:  templateDanone.id,
      companyName: 'Nestlé Benefícios',
      designTokens: {
        colorPrimary:   '#c8102e',
        colorSecondary: '#003087',
        fontFamily:     'Nunito, sans-serif',
        logoUrl:        '',
        footerLogoUrl:  '',
      },
      sections: {
        create: [
          { type: 'hero',         order: 1, enabled: true,  content: { title: 'Bem-vindo ao programa Nestlé', subtitle: 'Descubra as <strong>melhores ofertas</strong> para você e sua família.', ctaText: 'Saiba mais', ctaTarget: 'produtos' } },
          { type: 'about',        order: 2, enabled: true,  content: {} },
          { type: 'products',     order: 3, enabled: true,  content: {} },
          { type: 'how-it-works', order: 4, enabled: true,  content: {} },
          { type: 'pharmacy',     order: 5, enabled: true,  content: { title: 'Encontre um ponto de venda' } },
          { type: 'partners',     order: 6, enabled: true,  content: {} },
          { type: 'faq',          order: 7, enabled: true,  content: { title: 'Perguntas Frequentes', items: [{ question: 'Quem pode participar?', answer: 'Qualquer pessoa com CPF válido pode se cadastrar.' }] } },
        ],
      },
    },
  });

  // ── Site Unilever ──────────────────────────────────────────────────────────
  await prisma.site.create({
    data: {
      slug:        'unilever-promo',
      siteSlug:    'promo',
      clientId:    clientUnilever.id,
      templateId:  templateDanone.id,
      companyName: 'Unilever Promoções',
      designTokens: {
        colorPrimary:   '#1f3d7a',
        colorSecondary: '#e2001a',
        fontFamily:     'Nunito, sans-serif',
        logoUrl:        '',
        footerLogoUrl:  '',
      },
      sections: {
        create: [
          { type: 'hero',         order: 1, enabled: true,  content: { title: 'Programa de promoções Unilever', subtitle: 'Aproveite as <strong>melhores condições</strong> exclusivas para você.', ctaText: 'Quero participar', ctaTarget: 'produtos' } },
          { type: 'about',        order: 2, enabled: true,  content: {} },
          { type: 'products',     order: 3, enabled: true,  content: {} },
          { type: 'how-it-works', order: 4, enabled: true,  content: {} },
          { type: 'pharmacy',     order: 5, enabled: true,  content: { title: 'Encontre a farmácia mais próxima de você' } },
          { type: 'partners',     order: 6, enabled: true,  content: {} },
          { type: 'faq',          order: 7, enabled: true,  content: { title: 'Dúvidas', items: [{ question: 'Como funciona?', answer: 'Cadastre-se com seu CPF e apresente o cupom no ponto de venda.' }] } },
        ],
      },
    },
  });

  console.log(`
Seed concluído:
  Templates: Template Danone (template-danone)
  Clientes:  Danone (2 sites), Nestlé (1 site), Unilever (1 site)
  Total sites: 4
  `);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

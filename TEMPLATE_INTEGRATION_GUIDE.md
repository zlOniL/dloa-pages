# Guia de Integração de Novos Templates

Este guia descreve o processo completo para adicionar um novo template ao sistema DLOA Pages.
Os templates são construídos no **Lovable** (Vite + React + TypeScript) e precisam ser adaptados
para funcionar dentro do CMS.

---

## Visão Geral da Arquitetura

Antes de começar, entenda como o sistema renderiza templates:

```
Banco de dados (Site)
  └── templateKey: "template-xyz"         ← identifica qual template usar
  └── sections: [{ type, content, ... }]  ← dados editáveis no CMS
  └── designTokens: { colors, logos, ... }

Requisição pública /:clientSlug/:siteSlug
  └── API retorna site + templateKey
  └── Frontend chama getTemplate("template-xyz")
        └── registry.ts devolve { sectionsMap, Footer, schemas }
              └── sectionsMap["hero"] → HeroBanner
              └── HeroBanner recebe { content, slug }
                    └── content.title, content._images.xyz, etc.
```

**Regra fundamental:** O template é um conjunto de componentes React que recebem dados do banco
via `content: any`. Nenhum dado deve ser hardcoded — tudo que o usuário pode editar vive em `content`.

---

## Estrutura de Arquivos de um Template

Cada template ocupa uma pasta isolada dentro de `frontend/components/templates/`:

```
frontend/components/templates/
  registry.ts                    ← registry central (adicionar entrada aqui)
  template_danone/               ← template de referência
    Navigation.tsx
    Footer.tsx
    HeroBanner.tsx
    AboutSection.tsx
    ProductsSection.tsx
    HowItWorks.tsx
    FAQSection.tsx
    PharmacyFinder.tsx
    PartnersSection.tsx
    sectionsMap.tsx              ← entry point: mapeia section.type → componente
    schemas.ts                   ← define os campos editáveis no CMS
  template_xyz/                  ← novo template (você vai criar isso)
    Navigation.tsx
    Footer.tsx
    [SuasSecoes].tsx
    sectionsMap.tsx
    schemas.ts
```

---

## Checklist de Integração

- [ ] Passo 1 — Criar a pasta do template
- [ ] Passo 2 — Copiar e adaptar os componentes do Lovable
- [ ] Passo 3 — Adaptar a Navigation
- [ ] Passo 4 — Adaptar o Footer
- [ ] Passo 5 — Criar `sectionsMap.tsx`
- [ ] Passo 6 — Criar `schemas.ts`
- [ ] Passo 7 — Registrar no backend (`registry.ts`)
- [ ] Passo 8 — Inserir o template no banco (Neon)
- [ ] Passo 9 — Registrar no frontend (`registry.ts`)
- [ ] Passo 10 — Testar

---

## Passo 1 — Criar a Pasta do Template

Crie a pasta do novo template. Use o padrão `template_` seguido de um identificador em snake_case:

```bash
mkdir frontend/components/templates/template_xyz
```

A `key` do template no banco **deve bater** com a entrada no registry. Use o mesmo identificador
com hífen no banco: `template-xyz`.

---

## Passo 2 — Copiar e Adaptar os Componentes do Lovable

O projeto Lovable tem seus componentes de seção em:
```
src/components/sections/   ← seções principais (Hero, About, FAQ, etc.)
src/components/ui/         ← componentes de UI (Navigation, Footer, etc.)
```

Copie os arquivos de seção para `frontend/components/templates/template_xyz/`.

### A única regra de adaptação

No Lovable, os componentes têm dados hardcoded:
```tsx
// Lovable — dado hardcoded
export function HeroBanner() {
  const title = "Bem-vindo ao programa";
  const bgColor = "#2C3A64";
  const img = "/src/assets/hero.png";
  return <header style={{ background: bgColor }}>...</header>;
}
```

No CMS, **tudo que é editável vem de `content`** e tem um fallback para o valor original:
```tsx
// CMS — dado vem do banco com fallback para o original do Lovable
export function HeroBanner({ content, slug }: { content: any; slug: string }) {
  const title  = content.title    ?? "Bem-vindo ao programa";
  const img    = content._images?.hero ?? "/assets/hero.png";
  return (
    <header style={{ backgroundColor: 'var(--color-primary)' }}>
      ...
    </header>
  );
}
```

### Três categorias de dados editáveis

#### 1. Textos e campos simples → `content.campo`
```tsx
// No componente
const title    = content.title    ?? "Título padrão";
const subtitle = content.subtitle ?? "Subtítulo padrão";
const ctaText  = content.ctaText  ?? "Clique aqui";
```

#### 2. Imagens substituíveis → `content._images.chave`
```tsx
// No componente
const banner   = content._images?.banner   ?? '/assets/banner-padrao.png';
const heroImg  = content._images?.heroImg  ?? '/assets/hero.png';
```
> A chave do `_images` deve bater exatamente com a `key` definida no `schemas.ts`.

#### 3. Cores de seção → `var(--color-primary)` e `var(--color-secondary)`
```tsx
// Nunca use cores hardcoded em seções — use as CSS vars
<section style={{ backgroundColor: 'var(--color-primary)' }}>
<button style={{ backgroundColor: 'var(--color-secondary)' }}>
```
> As CSS vars são definidas pelos `designTokens` do site e podem ser sobrescritas
> por seção via `content._colors.primary` e `content._colors.secondary`
> (o sistema aplica isso automaticamente na página, o componente não precisa fazer nada).

### Exemplo completo de adaptação

**Antes (Lovable):**
```tsx
export function AboutSection() {
  return (
    <section id="sobre" className="w-full bg-white">
      <img src="/src/assets/about-banner.png" alt="Sobre" className="w-full" />
      <h2 className="text-[#2C3A64] text-3xl font-bold">Sobre o programa</h2>
      <p>Texto fixo sobre o programa...</p>
    </section>
  );
}
```

**Depois (CMS):**
```tsx
export function AboutSection({ content }: { content?: any }) {
  const banner = content?._images?.banner ?? '/assets/about-banner.png';
  const title  = content?.title ?? 'Sobre o programa';
  const text   = content?.text  ?? 'Texto fixo sobre o programa...';

  return (
    <section id="sobre" className="w-full bg-white">
      <img src={banner} alt="Sobre" className="w-full" />
      <h2 className="text-[#2C3A64] text-3xl font-bold">{title}</h2>
      <p>{text}</p>
    </section>
  );
}
```

### O que NÃO adaptar

Não exponha via `content` coisas que não fazem sentido o usuário editar:
- IDs de elementos HTML (`id="sobre"`, `id="produtos"`) — são âncoras do menu, não mudar
- Classes de layout e animação — são parte do design do template
- Lógica interna dos componentes (ex: accordion do FAQ, slider de produtos)

---

## Passo 3 — Adaptar a Navigation

A Navigation é um componente especial: ela é renderizada dentro do `HeroBanner` e recebe
`logoUrl` e `navItems` injetados automaticamente pelo sistema via `content._navItems` e
`content.logoUrl`.

### Interface obrigatória
```tsx
// frontend/components/templates/template_xyz/Navigation.tsx
'use client';

export interface NavItem { label: string; href: string }

interface NavigationProps {
  slug: string;
  logoUrl?: string;
  navItems?: NavItem[];
}

export function Navigation({ slug, logoUrl, navItems }: NavigationProps) {
  const DEFAULT_NAV_ITEMS: NavItem[] = [
    { label: 'Início',   href: '' },
    { label: 'Produtos', href: 'produtos' },
    // ... itens padrão do seu template
  ];

  const items = navItems?.length ? navItems : DEFAULT_NAV_ITEMS;

  const handleClick = (href: string) => {
    if (!href) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (href.startsWith('http') || href.startsWith('/')) {
      window.open(href, '_blank', 'noopener noreferrer'); return;
    }
    document.getElementById(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav>
      <a href={`/${slug}`}>
        <img src={logoUrl ?? '/assets/seu-logo-padrao.svg'} alt="Logo" />
      </a>
      {items.map((item, i) => (
        <button key={i} onClick={() => handleClick(item.href)}>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
```

### Como a Navigation é chamada no HeroBanner

```tsx
// No HeroBanner do seu template
import { Navigation, NavItem } from './Navigation';

export function HeroBanner({ content, slug }: { content: any; slug: string }) {
  return (
    <header>
      {/* O sistema injeta _navItems e logoUrl automaticamente no content do hero */}
      <Navigation
        slug={slug}
        logoUrl={content.logoUrl}
        navItems={content._navItems}
      />
      {/* resto do hero */}
    </header>
  );
}
```

---

## Passo 4 — Adaptar o Footer

O Footer recebe `footerLogoUrl` e `footerLinks` como props — injetados automaticamente
pelo sistema a partir dos `designTokens` do site.

### Interface obrigatória
```tsx
// frontend/components/templates/template_xyz/Footer.tsx
'use client';

export interface FooterLink { label: string; href: string }

interface FooterProps {
  footerLogoUrl?: string;
  footerLinks?: FooterLink[];
}

export function Footer({ footerLogoUrl, footerLinks }: FooterProps) {
  const DEFAULT_FOOTER_LINKS: FooterLink[] = [
    { label: 'Início',        href: '' },
    { label: 'Sobre nós',     href: 'sobre' },
    // ... links padrão do seu template
  ];

  const links = footerLinks?.length ? footerLinks : DEFAULT_FOOTER_LINKS;

  const handleClick = (href: string) => {
    if (!href) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (href.startsWith('http') || href.startsWith('/')) {
      window.open(href, '_blank', 'noopener noreferrer'); return;
    }
    document.getElementById(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer style={{ backgroundColor: 'var(--color-primary)' }}>
      <img src={footerLogoUrl ?? '/assets/seu-logo-footer.svg'} alt="Logo" />
      <nav>
        {links.map((item, i) => (
          <button key={i} onClick={() => handleClick(item.href)}>
            {item.label}
          </button>
        ))}
      </nav>
    </footer>
  );
}
```

---

## Passo 5 — Criar `sectionsMap.tsx`

O `sectionsMap` é o **entry point** do template. Ele mapeia o `section.type` (string do banco)
para o componente React correspondente.

```tsx
// frontend/components/templates/template_xyz/sectionsMap.tsx
import { HeroBanner }    from './HeroBanner';
import { AboutSection }  from './AboutSection';
import { ProductsSection } from './ProductsSection';
// ... importe todas as suas seções

type SectionProps = { content: any; slug?: string };

export const sectionsMap: Record<string, React.ComponentType<SectionProps>> = {
  hero:           ({ content, slug }) => <HeroBanner content={content} slug={slug ?? ''} />,
  about:          ({ content })       => <AboutSection content={content} />,
  products:       ({ content })       => <ProductsSection content={content} />,
  'how-it-works': ({ content })       => <HowItWorks content={content} />,
  faq:            ({ content })       => <FAQSection content={content} />,
  // ... uma entrada por seção do seu template
};
```

> **Importante:** As keys do `sectionsMap` (`"hero"`, `"about"`, etc.) devem bater exatamente
> com os `type` das seções definidos no Passo 7 (backend registry). Se o type no banco é
> `"banner-principal"`, a key aqui deve ser `"banner-principal"`.

---

## Passo 6 — Criar `schemas.ts`

O `schemas.ts` define **quais campos aparecem no CMS editor** para cada seção.
Sem esse arquivo, as seções aparecem no editor mas sem nenhum campo editável.

```ts
// frontend/components/templates/template_xyz/schemas.ts
import type { SectionSchema } from '../template_danone/schemas';
// Reutiliza os tipos do template_danone (são genéricos do sistema)

export const schemas: Record<string, SectionSchema> = {

  hero: {
    // Cores de seção (sobrescrevem o global para esta seção)
    colors: [
      { key: 'primary',   label: 'Cor de fundo' },
      { key: 'secondary', label: 'Cor do botão' },
    ],
    // Campos de texto editáveis
    fields: [
      { key: 'title',     label: 'Título',         type: 'text' },
      { key: 'subtitle',  label: 'Subtítulo',       type: 'textarea' },
      { key: 'ctaText',   label: 'Texto do botão',  type: 'text' },
      { key: 'ctaTarget', label: 'Link do botão',   type: 'text' },
    ],
    // Imagens substituíveis (a key deve bater com content._images.key no componente)
    images: [
      { key: 'heroImg', label: 'Imagem principal', defaultSrc: '/assets/hero.png' },
    ],
  },

  about: {
    colors: [],
    fields: [
      { key: 'title', label: 'Título', type: 'text' },
      { key: 'text',  label: 'Texto',  type: 'textarea' },
    ],
    images: [
      { key: 'banner', label: 'Banner', defaultSrc: '/assets/about-banner.png' },
    ],
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

  // Seção sem campos editáveis (só toggle de visibilidade)
  partners: {
    colors: [],
    fields: [],
    images: [
      { key: 'strip', label: 'Faixa de parceiros', defaultSrc: '/assets/partners-strip.svg' },
    ],
  },
};
```

### Referência completa dos tipos de campo

| Tipo | Descrição | Exemplo no componente |
|---|---|---|
| `text` | Input de texto simples | `content.title ?? 'Padrão'` |
| `textarea` | Área de texto, suporta HTML | `content.subtitle` (com `dangerouslySetInnerHTML`) |
| `array` | Lista de itens com sub-campos | `content.items?.map(...)` |
| `products-list` | Editor especial de produtos (Danone-specific) | `content.products` |
| `images[].key` | Imagem substituível | `content._images?.chave ?? '/assets/default.png'` |
| `colors[].key` | Cor de seção | `var(--color-primary)` ou `var(--color-secondary)` |

---

## Passo 7 — Registrar no Backend

Adicione a estrutura de seções do template no registry do backend.
Isso define quais seções um site criado com esse template recebe automaticamente.

**Arquivo:** `backend/src/templates/registry.ts`

```ts
export const TEMPLATE_REGISTRY: Record<string, TemplateStructure> = {
  'template-danone': { ... }, // já existe

  'template-xyz': {
    sections: [
      {
        type: 'hero',
        order: 1,
        enabled: true,
        content: {
          // Valores padrão que o site receberá ao ser criado
          title: 'Título padrão do site',
          subtitle: 'Subtítulo com <strong>destaque</strong>.',
          ctaText: 'Clique aqui',
          ctaTarget: 'sobre',
        },
      },
      {
        type: 'about',
        order: 2,
        enabled: true,
        content: {},
      },
      {
        type: 'faq',
        order: 3,
        enabled: true,
        content: {
          title: 'Dúvidas Frequentes',
          items: [
            { question: 'Como funciona?', answer: 'Resposta padrão...' },
          ],
        },
      },
      // ... todas as seções do template
    ],
  },
};
```

> **Atenção:** Os `type` aqui devem bater exatamente com as keys do `sectionsMap.tsx` (Passo 5).

---

## Passo 8 — Inserir o Template no Banco (Neon)

Execute o SQL diretamente no Neon console ou via qualquer cliente PostgreSQL:

```sql
INSERT INTO "Template" (id, key, name, "previewUrl", "defaultConfig", "createdAt")
VALUES (
  gen_random_uuid(),
  'template-xyz',                -- deve bater com a key no registry
  'Nome Exibido no CMS',
  '/assets/preview-template-xyz.png',  -- imagem de preview (ou null)
  '{
    "colorPrimary":   "#000000",
    "colorSecondary": "#ffffff",
    "fontFamily":     "Inter, sans-serif",
    "logoUrl":        "",
    "footerLogoUrl":  ""
  }'::jsonb,
  now()
);
```

O campo `defaultConfig` define os valores padrão dos `designTokens` quando um novo site é criado
com esse template. O usuário pode alterar tudo isso no CMS depois.

**Para verificar se foi inserido:**
```sql
SELECT id, key, name FROM "Template" ORDER BY "createdAt";
```

---

## Passo 9 — Registrar no Frontend Registry

Adicione o novo template ao registry central do frontend.

**Arquivo:** `frontend/components/templates/registry.ts`

```ts
// Imports existentes
import { sectionsMap as danoneMap } from './template_danone/sectionsMap';
import { Footer as DanoneFooter }   from './template_danone/Footer';
import { schemas as danoneSchemas } from './template_danone/schemas';

// Novos imports
import { sectionsMap as xyzMap } from './template_xyz/sectionsMap';
import { Footer as XyzFooter }   from './template_xyz/Footer';
import { schemas as xyzSchemas } from './template_xyz/schemas';

const REGISTRY = {
  'template-danone': {
    sectionsMap: danoneMap,
    Footer:      DanoneFooter,
    schemas:     danoneSchemas,
  },
  'template-xyz': {        // ← adicionar esta entrada
    sectionsMap: xyzMap,
    Footer:      XyzFooter,
    schemas:     xyzSchemas,
  },
};

const FALLBACK = 'template-danone';

export function getTemplate(key?: string | null) {
  return REGISTRY[key ?? FALLBACK] ?? REGISTRY[FALLBACK];
}
```

---

## Passo 10 — Testar

### 10.1 Verificar que o template aparece no CMS

Acesse o CMS e crie um novo site. O template `template-xyz` deve aparecer na lista de
templates disponíveis para seleção.

Se o template não aparecer, verifique:
- Se o INSERT do Passo 8 foi executado corretamente
- Se há uma whitelist de ClientTemplate para o cliente (se houver, o template precisa estar nela)

### 10.2 Criar um site de teste

1. No CMS (`/cms`), selecione um cliente
2. Clique em **+ Novo Site**
3. Selecione o `template-xyz`
4. Preencha nome e slug
5. Clique em **Criar Site**

Se der erro `"Estrutura do template não encontrada"`, verifique:
- Se a key no Passo 7 (backend registry) bate com a key no banco (Passo 8)

### 10.3 Verificar a renderização pública

Acesse `http://localhost:3002/[clientSlug]/[siteSlug]`

- Todas as seções devem aparecer
- As cores padrão devem ser as do `defaultConfig`
- Os textos padrão devem ser os definidos no backend registry (Passo 7)

Se uma seção não aparecer, verifique:
- Se o `type` no backend registry bate com a key no `sectionsMap.tsx`
- Se o componente está importado e mapeado corretamente no `sectionsMap.tsx`

### 10.4 Verificar o CMS editor

Acesse o site criado via **Editar** no CMS.

- Cada seção deve aparecer na lista
- Ao clicar em **Editar ▼**, os campos definidos em `schemas.ts` devem aparecer
- Salvar uma seção e recarregar o preview deve refletir a mudança

Se os campos não aparecerem, verifique:
- Se `schemas.ts` tem uma entrada para o tipo da seção
- Se a key no `schemas.ts` bate com o `type` da seção

### 10.5 Verificar a resposta da API (opcional)

```bash
curl http://localhost:3000/sites/view/[clientSlug]/[siteSlug] | jq '.templateKey'
# deve retornar "template-xyz"
```

---

## Referência Rápida de Arquivos

| Arquivo | O que fazer |
|---|---|
| `frontend/components/templates/template_xyz/` | Criar pasta e adicionar todos os componentes |
| `frontend/components/templates/template_xyz/sectionsMap.tsx` | Criar — mapeia type → componente |
| `frontend/components/templates/template_xyz/schemas.ts` | Criar — define campos do CMS editor |
| `frontend/components/templates/registry.ts` | Adicionar entrada `'template-xyz': { ... }` |
| `backend/src/templates/registry.ts` | Adicionar entrada `'template-xyz': { sections: [...] }` |
| Banco Neon | Executar o INSERT do Passo 8 |

---

## Dúvidas Frequentes

### Por que meu texto editado no CMS não aparece na página?

O componente provavelmente ainda usa o valor hardcoded em vez de ler de `content`.
Certifique-se de que o campo está no formato `content.campo ?? 'valor padrão'`.

### Por que minha imagem não aparece após upload?

Verifique se o componente lê `content._images?.chave` e se a `chave` bate com a `key` definida
em `schemas.ts` → `images`.

### Posso reutilizar seções de outro template?

Sim. Se dois templates compartilham uma seção idêntica (ex: FAQ), você pode importar o componente
de outro template:
```tsx
import { FAQSection } from '../template_danone/FAQSection';
```
Mas lembre que os campos editáveis no CMS virão do `schemas.ts` do seu template — defina-os
mesmo que reutilize o componente.

### Como adicionar uma whitelist de clientes para o template?

Para restringir o template a clientes específicos, insira uma entrada na tabela `ClientTemplate`:

```sql
INSERT INTO "ClientTemplate" (id, "clientId", "templateId", "createdAt")
VALUES (
  gen_random_uuid(),
  '[uuid do cliente]',
  '[uuid do template]',
  now()
);
```

Se não houver nenhuma entrada de whitelist para um cliente, ele terá acesso a **todos** os templates.

### Como atualizar o conteúdo padrão das seções de um template?

O conteúdo padrão (definido no backend `registry.ts`) só é aplicado na **criação** de novos sites.
Sites já existentes não são afetados — edite o conteúdo diretamente pelo CMS.

### A preview no CMS editor não atualiza. O que fazer?

Use o botão **↺ Recarregar** na barra de preview. O preview é um iframe que aponta para a URL
pública do site — ele atualiza após cada save (com um delay de 400ms), mas pode demorar mais
dependendo do servidor.

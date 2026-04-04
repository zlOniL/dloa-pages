# DLOA Pages

Plataforma B2B de landing pages multi-tenant com CMS headless. Permite criar e gerenciar sites para múltiplos clientes a partir de templates pré-definidos, com edição visual em tempo real via painel CMS.

---

## Sumário

- [Arquitetura](#arquitetura)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Rodando localmente](#rodando-localmente)
- [Deploy](#deploy)
- [API — Endpoints](#api--endpoints)
- [Fluxo do CMS](#fluxo-do-cms)
- [Templates](#templates)
- [Principais decisões de projeto](#principais-decisões-de-projeto)

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    Repositório monorepo                  │
│                                                         │
│  ┌──────────────────┐       ┌──────────────────────┐   │
│  │   frontend/      │       │   backend/            │   │
│  │   Next.js 14     │──────▶│   NestJS 11           │   │
│  │   App Router     │ HTTP  │   REST API            │   │
│  │   SSR + CSR      │       │   Prisma + PostgreSQL │   │
│  └──────────────────┘       └──────────────────────┘   │
└─────────────────────────────────────────────────────────┘

Deploy:
  Frontend → Vercel  (Next.js)
  Backend  → Render  (NestJS + PostgreSQL via Neon)
```

**Stack:**

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, React 18 |
| Backend | NestJS 11, Prisma 5, PostgreSQL (Neon) |
| Infra | Vercel (frontend), Render (backend) |
| Mapas | Leaflet (buscador de farmácias — template Danone) |

---

## Estrutura do repositório

```
dloa-pages/
├── frontend/
│   ├── app/
│   │   ├── [slug]/page.tsx                      # Rota pública (slug legado)
│   │   ├── [slug]/[siteSlug]/page.tsx           # Rota pública (cliente/site)
│   │   ├── cms/
│   │   │   ├── page.tsx                         # CMS — lista de clientes
│   │   │   ├── clients/[clientId]/page.tsx      # CMS — sites do cliente
│   │   │   ├── clients/[clientId]/sites/new/    # CMS — criar site
│   │   │   └── sites/[siteId]/                  # CMS — editor de site
│   ├── components/
│   │   └── templates/
│   │       ├── types.ts                         # Tipos compartilhados
│   │       ├── registry.ts                      # Registry central de templates
│   │       ├── template_danone/                 # Template Danone
│   │       └── template_mojju/                  # Template MOJJU
│   ├── lib/
│   │   └── api-url.ts                           # Resolução de URL da API (SSR/CSR)
│   └── types/
│       └── site.ts                              # Tipo Site compartilhado
│
├── backend/
│   ├── src/
│   │   ├── main.ts                              # Bootstrap + CORS + uploads
│   │   ├── app.module.ts
│   │   ├── clients/                             # Módulo de clientes
│   │   ├── sites/                               # Módulo de sites + seções
│   │   ├── templates/
│   │   │   └── registry.ts                      # Estrutura padrão dos templates
│   │   └── prisma.service.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── package.json
│
├── .gitignore
├── render.yaml                                  # Config deploy Render
└── README.md
```

---

## Rodando localmente

### Pré-requisitos

- Node.js 18+
- npm 9+
- PostgreSQL (local ou [Neon](https://neon.tech) gratuito)

### 1. Clone e instale

```bash
git clone https://github.com/zlOniL/dloa-pages.git
cd dloa-pages
```

### 2. Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env`:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
CORS_ORIGIN="http://localhost:3001"
UPLOADS_DIR=                    # vazio = usa ./uploads relativo ao processo
PORT=3000
```

Rode as migrations e suba o servidor:

```bash
npx prisma migrate deploy       # aplica migrations existentes
npx prisma db seed              # (opcional) dados iniciais
npm run start:dev               # API em http://localhost:3000
```

> **Primeiro uso:** se preferir criar as tabelas do zero use `npx prisma migrate dev` em vez de `migrate deploy`.

### 3. Frontend

```bash
cd ../frontend
npm install
```

Crie o arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Suba o servidor:

```bash
npm run dev     # frontend em http://localhost:3001
```

> Next.js usa a porta 3000 por padrão; se o backend estiver na 3000, passe `PORT=3001 npm run dev` ou altere o script.

### 4. Seeder — dados iniciais

O banco começa vazio. Para testar, insira ao menos um Template via SQL ou Prisma Studio:

```bash
npx prisma studio    # abre GUI do banco em http://localhost:5555
```

Crie um registro na tabela `Template`:

| campo | valor sugerido |
|---|---|
| `key` | `template-danone` |
| `name` | `Danone` |
| `defaultConfig` | `{"colorPrimary":"#71bff3","colorSecondary":"#602A68","navItems":[{"label":"Início","href":""}]}` |

Repita para `template-mojju`.

---

## Deploy

### Frontend — Vercel

| Campo | Valor |
|---|---|
| Framework | Next.js (auto-detectado) |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Install Command | `npm ci` |

**Variáveis de ambiente:**

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL do backend no Render (ex: `https://dloa-backend.onrender.com`) |

### Backend — Render

Use o `render.yaml` na raiz ou configure manualmente:

| Campo | Valor |
|---|---|
| Runtime | Node |
| Root Directory | `backend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm run start:migrate` |

**Variáveis de ambiente:**

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | ✅ | Connection string PostgreSQL (Neon) |
| `CORS_ORIGIN` | ✅ | URL do frontend Vercel |
| `UPLOADS_DIR` | — | Caminho do disco persistente (ex: `/var/data/uploads`) |
| `NODE_ENV` | — | `production` |

> O Render injeta `PORT` automaticamente — não precisa setar.

---

## API — Endpoints

Base URL local: `http://localhost:3000`

---

### Health Check

#### `GET /`
Verifica se a API está no ar.

```bash
curl http://localhost:3000/
# → "Hello World!"
```

---

### Clientes

#### `GET /clients`

Lista clientes com paginação e busca.

**Query params:**

| Param | Tipo | Default | Descrição |
|---|---|---|---|
| `search` | string | — | Filtro por nome, CNPJ ou slug |
| `page` | number | `1` | Página atual |
| `limit` | number | `10` | Itens por página |

```bash
# Listar todos
curl "http://localhost:3000/clients"

# Com busca e paginação
curl "http://localhost:3000/clients?search=danone&page=1&limit=25"
```

**Resposta:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Danone Brasil",
      "cnpj": "12.345.678/0001-99",
      "slug": "danone",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "_count": { "sites": 2 }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "pages": 1
}
```

---

#### `POST /clients`

Cria um novo cliente.

```bash
curl -X POST http://localhost:3000/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Danone Brasil",
    "cnpj": "12.345.678/0001-99",
    "slug": "danone"
  }'
```

**Resposta:**
```json
{
  "id": "c1a2b3c4-...",
  "name": "Danone Brasil",
  "cnpj": "12.345.678/0001-99",
  "slug": "danone",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

#### `DELETE /clients/:id`

Remove o cliente e todos os seus sites (cascade).

```bash
curl -X DELETE http://localhost:3000/clients/c1a2b3c4-...
```

**Resposta:** `{ "deleted": true }`

---

### Templates

#### `GET /templates`

Lista todos os templates disponíveis. Opcionalmente filtra pela whitelist do cliente.

**Query params:**

| Param | Tipo | Descrição |
|---|---|---|
| `clientId` | string (UUID) | Se informado, retorna só templates permitidos para o cliente |

```bash
# Todos os templates
curl "http://localhost:3000/templates"

# Templates disponíveis para um cliente
curl "http://localhost:3000/templates?clientId=c1a2b3c4-..."
```

**Resposta:**
```json
[
  {
    "id": "t1a2b3...",
    "key": "template-danone",
    "name": "Danone",
    "previewUrl": null,
    "defaultConfig": { "colorPrimary": "#71bff3", "colorSecondary": "#602A68" },
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### Sites

#### `POST /sites`

Cria um novo site para um cliente a partir de um template. Inicializa automaticamente as seções com o conteúdo padrão do template.

```bash
curl -X POST http://localhost:3000/sites \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "c1a2b3c4-...",
    "templateId": "t1a2b3c4-...",
    "siteSlug": "meu-cupom-danone",
    "companyName": "Meu Cupom Danone"
  }'
```

**Resposta:** objeto `Site` completo com seções criadas.

---

#### `GET /clients/:clientId/sites`

Lista todos os sites de um cliente.

```bash
curl "http://localhost:3000/clients/c1a2b3c4-.../sites"
```

**Resposta:**
```json
[
  {
    "id": "s1a2b3...",
    "slug": "danone-meu-cupom-danone",
    "siteSlug": "meu-cupom-danone",
    "companyName": "Meu Cupom Danone",
    "template": { "id": "...", "key": "template-danone", "name": "Danone" },
    "_count": { "sections": 7 }
  }
]
```

---

#### `GET /sites/by-id/:id`

Busca um site pelo ID com seções, assets e dados do cliente.

```bash
curl "http://localhost:3000/sites/by-id/s1a2b3c4-..."
```

**Resposta:**
```json
{
  "id": "s1a2b3c4-...",
  "slug": "danone-meu-cupom-danone",
  "siteSlug": "meu-cupom-danone",
  "companyName": "Meu Cupom Danone",
  "templateKey": "template-danone",
  "client": { "id": "...", "slug": "danone", "name": "Danone Brasil" },
  "designTokens": {
    "colorPrimary": "#71bff3",
    "colorSecondary": "#602A68",
    "fontFamily": "sans-serif",
    "logoUrl": "",
    "footerLogoUrl": "",
    "navItems": [{ "label": "Início", "href": "" }],
    "footerLinks": []
  },
  "sections": [
    {
      "id": "sec1...",
      "type": "hero",
      "enabled": true,
      "order": 1,
      "content": { "title": "Participe do programa de desconto" }
    }
  ],
  "assets": []
}
```

---

#### `GET /sites/view/:clientSlug/:siteSlug`

Rota pública — busca site pelo slug do cliente + slug do site. Usada pelo frontend para renderizar a página pública.

```bash
curl "http://localhost:3000/sites/view/danone/meu-cupom-danone"
```

---

#### `PATCH /sites/by-id/:id`

Atualiza design tokens e/ou nome do site.

```bash
curl -X PATCH "http://localhost:3000/sites/by-id/s1a2b3c4-..." \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Novo Nome",
    "designTokens": {
      "colorPrimary": "#0057b7",
      "colorSecondary": "#ffd700",
      "fontFamily": "Georgia, serif",
      "navItems": [
        { "label": "Início", "href": "" },
        { "label": "Produtos", "href": "produtos" }
      ]
    }
  }'
```

---

#### `PATCH /sites/by-id/:id/sections/:sectionId`

Atualiza o conteúdo e/ou visibilidade de uma seção específica.

```bash
# Desativar uma seção
curl -X PATCH "http://localhost:3000/sites/by-id/s1.../sections/sec1..." \
  -H "Content-Type: application/json" \
  -d '{ "enabled": false }'

# Atualizar conteúdo da seção hero
curl -X PATCH "http://localhost:3000/sites/by-id/s1.../sections/sec1..." \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "title": "Novo título da hero",
      "subtitle": "Subtítulo com <strong>HTML</strong>",
      "ctaText": "Quero participar",
      "ctaTarget": "produtos",
      "_colors": { "primary": "#003c82" },
      "_images": { "desktopProducts": "https://..." }
    }
  }'
```

---

#### `POST /sites/by-id/:id/upload`

Faz upload de um arquivo (imagem ou vídeo) vinculado ao site.

```bash
curl -X POST "http://localhost:3000/sites/by-id/s1a2b3c4-.../upload" \
  -F "file=@/caminho/para/imagem.png"
```

**Resposta:**
```json
{ "url": "/uploads/a1b2c3d4-e5f6-....png" }
```

> Em produção no Vercel o upload vai para `/tmp/uploads` (efêmero). Use Render com disco persistente para uploads duráveis.

---

#### `DELETE /sites/:id`

Remove o site e todas as suas seções e assets.

```bash
curl -X DELETE "http://localhost:3000/sites/s1a2b3c4-..."
```

**Resposta:** `{ "deleted": true }`

---

### Endpoints legados (por slug)

Mantidos para retrocompatibilidade. Preferir os endpoints `by-id` para novos desenvolvimentos.

| Método | Rota | Equivalente moderno |
|---|---|---|
| `GET` | `/sites/:slug` | `GET /sites/by-id/:id` |
| `PATCH` | `/sites/:slug` | `PATCH /sites/by-id/:id` |
| `PATCH` | `/sites/:slug/sections/:id` | `PATCH /sites/by-id/:id/sections/:sectionId` |
| `POST` | `/sites/:slug/upload` | `POST /sites/by-id/:id/upload` |
| `POST` | `/sites/:slug/assets` | — |

---

## Fluxo do CMS

```
/cms
 └── Lista de clientes (GET /clients)
      └── /cms/clients/:clientId
           └── Lista de sites do cliente (GET /clients/:id/sites)
                ├── /cms/clients/:clientId/sites/new
                │    └── Seleciona template → POST /sites
                │         └── Redireciona para o editor
                └── /cms/sites/:siteId
                     └── Editor visual
                          ├── Aparência global (cores, fonte, logos)
                          │    └── PATCH /sites/by-id/:id  { designTokens }
                          ├── Seções (ativar/desativar + editar conteúdo)
                          │    └── PATCH /sites/by-id/:id/sections/:sectionId
                          ├── Menu de navegação (navItems)
                          │    └── PATCH /sites/by-id/:id  { designTokens: { navItems } }
                          └── Links do rodapé (footerLinks)
                               └── PATCH /sites/by-id/:id  { designTokens: { footerLinks } }
```

**URL pública gerada:** `/{clientSlug}/{siteSlug}`

Exemplo: cliente `danone`, site `meu-cupom` → URL `https://seu-dominio.com/danone/meu-cupom`

---

## Templates

Templates são self-contained em `frontend/components/templates/template_xyz/`:

```
template_xyz/
├── sectionsMap.tsx    # Mapeia tipo de seção → componente React
├── Footer.tsx         # Componente de rodapé
└── schemas.ts         # Define campos editáveis por seção no CMS
```

Para registrar um novo template, adicione uma entrada em:
- `frontend/components/templates/registry.ts` — componentes + defaults de UI
- `backend/src/templates/registry.ts` — estrutura de seções + conteúdo padrão
- Tabela `Template` no banco — `key`, `name`, `defaultConfig`

### Templates disponíveis

#### `template-danone`
Landing page de programa de fidelidade farmacêutico. Seções: `hero`, `about`, `products`, `how-it-works`, `pharmacy`, `partners`, `faq`.

#### `template-mojju`
Landing page de produtora de vídeo com IA. Seções: `hero`, `portfolio`, `about`, `services`, `contact`. Footer com Quick Links (nav) e Tools We Use (ferramentas de IA como links externos).

---

## Principais decisões de projeto

### Monorepo sem workspace manager
Frontend e backend no mesmo repositório sem Turborepo/Nx. Mantém simplicidade e permite Vercel + Render cada um apontar para seu subdiretório.

### Templates isolados por pasta
Cada template é completamente autocontido. O `registry.ts` do frontend é o único ponto de acoplamento — adicionar um template novo nunca toca em código existente.

### `designTokens` como JSON livre no banco
Evita migrations para cada novo campo de aparência. O frontend lê o JSON e aplica CSS variables (`--color-primary`, `--color-secondary`, `--font-family`) que cascateiam para todos os componentes da seção.

### `templateKey` resolvido via raw SQL
O campo `key` do modelo `Template` é novo e o Prisma Client pode estar com schema desatualizado em produção. `getTemplateKey()` usa `$queryRaw` para garantir que sempre leia do banco real, independente do estado do client gerado.

### Cache em memória de 1 hora no backend
Listas de templates e sites por cliente são cacheadas com `CacheManager`. Invalidação explícita em cada mutação (create/delete). Reduz carga no banco para rotas públicas de alto tráfego.

### SSR nas rotas públicas
`/[slug]/[siteSlug]/page.tsx` é um Server Component que busca o site no backend e renderiza HTML completo. Sem JavaScript necessário para o visitante ver o conteúdo — melhor para SEO e LCP.

### `getApiUrl()` para resolver URL da API em SSR
`NEXT_PUBLIC_API_URL` com valor relativo (ex: `/_/backend`) funciona no browser mas não no Node.js do Next.js (sem `window.location`). A função prepende `https://VERCEL_URL` automaticamente quando detecta ambiente servidor.

### Uploads efêmeros no Vercel, persistentes no Render
Vercel não tem filesystem persistente; uploads vão para `/tmp/uploads` (perdidos no cold start). Para uso real de uploads, o backend deve rodar no Render com disco persistente montado em `/var/data/uploads`.

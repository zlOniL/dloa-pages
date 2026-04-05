# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DLOA Pages** is a B2B multi-tenant landing page SaaS. Admins use the headless CMS to manage **Clients** → **Sites** → **Sections**, while public pages render at `/{clientSlug}/{siteSlug}` via SSR.

## Monorepo Structure

This is a two-package monorepo with no workspace manager — each package is deployed independently:

- `frontend/` — Next.js 14 (deployed to Vercel)
- `backend/` — NestJS 11 + Prisma (deployed to Render)
- `prisma/` — Prisma schema and migrations (shared, but run by the backend)

## Commands

All commands must be run from the respective subdirectory.

### Frontend (`cd frontend`)
```bash
npm run dev     # Dev server on http://localhost:3001
npm run build   # Production build
npm run lint    # ESLint
```

### Backend (`cd backend`)
```bash
npm run start:dev    # NestJS watch mode on http://localhost:3000
npm run build        # Compile TypeScript → dist/
npm run lint         # ESLint with autofix
npm run format       # Prettier
npm run test         # Jest unit tests
npm run test:watch   # Jest watch mode
npm run test:cov     # Coverage report
npm run test:e2e     # E2E tests
```

### Database
```bash
# From repo root or backend/
npx prisma migrate dev      # Create + apply migration in dev
npx prisma migrate deploy   # Apply pending migrations (production)
npx prisma studio           # Visual DB browser
```

## Environment Variables

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Backend** (`.env`):
```
DATABASE_URL=postgresql://...
CORS_ORIGIN=http://localhost:3001
PORT=3000
```

## Architecture

### Data Model
Five Prisma models: `Client` → `Site` → `Section` and `Site` → `Asset`. `ClientTemplate` is a join table that whitelists which templates a client may use. Both `designTokens` (colors, fonts, logos, navItems, footerLinks) and section `content` are stored as JSON blobs.

### Public Page Rendering (`/[slug]/[siteSlug]`)
Server Component fetches `GET /sites/view/:clientSlug/:siteSlug`, resolves the `templateKey`, applies `designTokens` as CSS custom properties (`--color-primary`, `--color-secondary`, `--font-family`, etc.), then renders the template's section components in order, filtering out `enabled: false` sections.

### CMS (`/cms/...`)
Client Components. The main editor is `frontend/app/cms/sites/[siteId]/SiteEditor.tsx`. It PATCHes `designTokens` on the site and `content`/`enabled` on individual sections. Changes are previewed via a live iframe reload.

### Template System
Each template is self-contained under `frontend/components/templates/template_xyz/`:
- `sectionsMap.tsx` — maps section type string → React component
- `Footer.tsx` — template-specific footer
- `schemas.ts` — CMS form field definitions per section type

**Both** `frontend/components/templates/registry.ts` and `backend/src/templates/registry.ts` must be updated when adding a new template. The backend registry is used when initializing sections on site creation.

### Backend Caching
NestJS `CacheManager` with 1-hour TTL. Cache keys: `clients:{search}:{page}:{limit}`, `sites:client:{clientId}`, `templates:{clientId|all}`. All mutation handlers explicitly invalidate relevant keys.

## Key API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/sites/view/:clientSlug/:siteSlug` | Public SSR data fetch |
| GET | `/sites/by-id/:id` | CMS site fetch (with sections) |
| PATCH | `/sites/by-id/:id` | Update designTokens |
| PATCH | `/sites/by-id/:id/sections/:sectionId` | Update section content/enabled |
| POST | `/sites/by-id/:id/upload` | File upload → `/uploads/...` URL |
| GET | `/templates` | List templates (filtered by `?clientId=`) |

## Adding a New Template

1. Create `frontend/components/templates/template_xyz/` with `sectionsMap.tsx`, `Footer.tsx`, `schemas.ts`
2. Register in `frontend/components/templates/registry.ts`
3. Register in `backend/src/templates/registry.ts` (section types + default content)
4. Insert a row into the `Template` table (key must match registry key)
5. Optionally associate with a client via `ClientTemplate`

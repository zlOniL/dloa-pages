import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaService } from '../prisma.service';
import { getTemplateStructure } from '../templates/registry';

const CACHE_TTL = 3600_000;

@Injectable()
export class SitesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: any,
  ) {}

  // ── Helper: get template key via raw SQL (Prisma client may be stale) ───────

  private async getTemplateKey(templateId?: string | null): Promise<string | null> {
    if (!templateId) return null;
    const rows = await this.prisma.$queryRaw<{ key: string }[]>`
      SELECT key FROM "Template" WHERE id = ${templateId}
    `;
    return rows[0]?.key ?? null;
  }

  // ── Find by slug (legacy) ─────────────────────────────────────────────────

  async findBySlug(slug: string) {
    const site = await this.prisma.site.findUnique({
      where: { slug },
      include: { sections: { orderBy: { order: 'asc' } }, assets: true },
    });
    if (!site) throw new NotFoundException(`Site "${slug}" não encontrado`);
    return { ...site, templateKey: await this.getTemplateKey((site as any).templateId) };
  }

  // ── Find by id ────────────────────────────────────────────────────────────

  async findById(id: string) {
    const site = await this.prisma.site.findUnique({
      where: { id },
      include: {
        sections: { orderBy: { order: 'asc' } },
        assets: true,
        client: { select: { id: true, slug: true, name: true } },
      },
    });
    if (!site) throw new NotFoundException(`Site "${id}" não encontrado`);
    return { ...site, templateKey: await this.getTemplateKey((site as any).templateId) };
  }

  // ── Find by clientSlug + siteSlug (public route) ──────────────────────────

  async findByClientSlugAndSiteSlug(clientSlug: string, siteSlug: string) {
    const client = await this.prisma.client.findUnique({ where: { slug: clientSlug } });
    if (!client) throw new NotFoundException(`Cliente "${clientSlug}" não encontrado`);

    const site = await this.prisma.site.findFirst({
      where: { clientId: client.id, siteSlug },
      include: { sections: { orderBy: { order: 'asc' } }, assets: true },
    });
    if (!site) throw new NotFoundException(`Site "${clientSlug}/${siteSlug}" não encontrado`);
    return { ...site, templateKey: await this.getTemplateKey((site as any).templateId) };
  }

  // ── Sites by client ───────────────────────────────────────────────────────

  async findByClient(clientId: string) {
    const cacheKey = `sites:client:${clientId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const client = await this.prisma.client.findUnique({ where: { id: clientId } });
    if (!client) throw new NotFoundException(`Cliente "${clientId}" não encontrado`);

    const sites = await this.prisma.site.findMany({
      where: { clientId },
      include: {
        template: true,
        _count: { select: { sections: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    await this.cache.set(cacheKey, sites, CACHE_TTL);
    return sites;
  }

  // ── Templates (with whitelist) ────────────────────────────────────────────

  async findTemplates(clientId?: string) {
    const cacheKey = `templates:${clientId ?? 'all'}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const allTemplates = await this.prisma.template.findMany({ orderBy: { name: 'asc' } });

    if (!clientId) {
      await this.cache.set(cacheKey, allTemplates, CACHE_TTL);
      return allTemplates;
    }

    const whitelist = await this.prisma.clientTemplate.findMany({ where: { clientId } });
    const result = whitelist.length === 0
      ? allTemplates
      : allTemplates.filter((t) => whitelist.some((w) => w.templateId === t.id));

    await this.cache.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  // ── Create site ───────────────────────────────────────────────────────────

  async createSite(data: { clientId: string; templateId?: string; siteSlug: string; companyName: string; type?: string }) {
    const client = await this.prisma.client.findUnique({ where: { id: data.clientId } });
    if (!client) throw new NotFoundException(`Cliente "${data.clientId}" não encontrado`);

    const siteType = data.type === 'html' ? 'html' : 'template';
    const slug = `${client.slug}-${data.siteSlug}`;

    if (siteType === 'html') {
      const site = await this.prisma.site.create({
        data: {
          slug,
          siteSlug: data.siteSlug,
          clientId: data.clientId,
          companyName: data.companyName,
          type: 'html',
          customHtml: '',
          designTokens: {},
        },
        include: { sections: { orderBy: { order: 'asc' } } },
      });
      await this.cache.del(`sites:client:${data.clientId}`);
      return site;
    }

    if (!data.templateId) throw new BadRequestException('templateId é obrigatório para sites do tipo template');

    // Use raw SQL to include the `key` field (Prisma client may be stale)
    type TemplateRow = { id: string; key: string; name: string; defaultConfig: any };
    const [template] = await this.prisma.$queryRaw<TemplateRow[]>`
      SELECT id, key, name, "defaultConfig" FROM "Template" WHERE id = ${data.templateId}
    `;
    if (!template) throw new NotFoundException(`Template "${data.templateId}" não encontrado`);

    const whitelist = await this.prisma.clientTemplate.findMany({ where: { clientId: data.clientId } });
    if (whitelist.length > 0 && !whitelist.some((w) => w.templateId === data.templateId)) {
      throw new BadRequestException('Template não disponível para este cliente');
    }

    const structure = getTemplateStructure(template.key);
    if (!structure) throw new BadRequestException(`Estrutura do template "${template.key}" não encontrada`);

    const site = await this.prisma.site.create({
      data: {
        slug,
        siteSlug: data.siteSlug,
        clientId: data.clientId,
        templateId: data.templateId,
        companyName: data.companyName,
        type: 'template',
        designTokens: template.defaultConfig,
        sections: { create: structure.sections },
      },
      include: { sections: { orderBy: { order: 'asc' } } },
    });

    await this.cache.del(`sites:client:${data.clientId}`);
    await this.cache.del(`templates:${data.clientId}`);
    await this.cache.del('templates:all');
    return site;
  }

  // ── Delete site ───────────────────────────────────────────────────────────

  async deleteSite(id: string) {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site) throw new NotFoundException(`Site "${id}" não encontrado`);
    await this.prisma.site.delete({ where: { id } });
    await this.cache.del(`sites:client:${(site as any).clientId}`);
    return { deleted: true };
  }

  // ── Update site (by slug) ─────────────────────────────────────────────────

  async updateSite(slug: string, body: { designTokens?: any; companyName?: string }) {
    const site = await this.prisma.site.findUnique({ where: { slug } });
    if (!site) throw new NotFoundException(`Site "${slug}" não encontrado`);
    return this.prisma.site.update({
      where: { slug },
      data: {
        ...(body.companyName && { companyName: body.companyName }),
        ...(body.designTokens && { designTokens: body.designTokens }),
      },
    });
  }

  // ── Update site (by id) ───────────────────────────────────────────────────

  async updateSiteById(id: string, body: { designTokens?: any; companyName?: string; customHtml?: string }) {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site) throw new NotFoundException(`Site "${id}" não encontrado`);
    return this.prisma.site.update({
      where: { id },
      data: {
        ...(body.companyName && { companyName: body.companyName }),
        ...(body.designTokens && { designTokens: body.designTokens }),
        ...(body.customHtml !== undefined && { customHtml: body.customHtml }),
      },
    });
  }

  // ── Update section (by slug) ──────────────────────────────────────────────

  async updateSection(slug: string, id: string, body: { enabled?: boolean; content?: any }) {
    const site = await this.prisma.site.findUnique({ where: { slug } });
    if (!site) throw new NotFoundException(`Site "${slug}" não encontrado`);
    return this.prisma.section.update({
      where: { id },
      data: {
        ...(body.enabled !== undefined && { enabled: body.enabled }),
        ...(body.content !== undefined && { content: body.content }),
      },
    });
  }

  // ── Update section (by siteId) ────────────────────────────────────────────

  async updateSectionById(siteId: string, sectionId: string, body: { enabled?: boolean; content?: any }) {
    return this.prisma.section.update({
      where: { id: sectionId },
      data: {
        ...(body.enabled !== undefined && { enabled: body.enabled }),
        ...(body.content !== undefined && { content: body.content }),
      },
    });
  }

  // ── Create asset ──────────────────────────────────────────────────────────

  async createAsset(slug: string, body: { url: string; type: string }) {
    const site = await this.prisma.site.findUnique({ where: { slug } });
    if (!site) throw new NotFoundException(`Site "${slug}" não encontrado`);
    return this.prisma.asset.create({ data: { siteId: site.id, url: body.url, type: body.type } });
  }
}

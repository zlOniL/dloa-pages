import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaService } from '../prisma.service';

const CACHE_TTL = 3600_000;

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: any,
  ) {}

  async findAll(search?: string, page = 1, limit = 10) {
    const cacheKey = `clients:${search ?? ''}:${page}:${limit}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const where = search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { cnpj: { contains: search } }] }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        include: { _count: { select: { sites: true } } },
      }),
      this.prisma.client.count({ where }),
    ]);

    const result = { items, total, page, limit, pages: Math.ceil(total / limit) };
    await this.cache.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  async create(data: { name: string; cnpj: string; slug: string }) {
    const exists = await this.prisma.client.findFirst({
      where: { OR: [{ cnpj: data.cnpj }, { slug: data.slug }] },
    });
    if (exists) throw new ConflictException('CNPJ ou slug já cadastrado');

    const client = await this.prisma.client.create({ data });
    await this.cache.reset?.();
    return client;
  }

  async delete(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException(`Cliente "${id}" não encontrado`);

    await this.prisma.site.deleteMany({ where: { clientId: id } });
    await this.prisma.clientTemplate.deleteMany({ where: { clientId: id } });
    await this.prisma.client.delete({ where: { id } });
    await this.cache.reset?.();
    return { deleted: true };
  }
}

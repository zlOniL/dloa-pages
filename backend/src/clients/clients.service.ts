import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string, page = 1, limit = 10) {
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

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async create(data: { name: string; cnpj: string; slug: string }) {
    const exists = await this.prisma.client.findFirst({
      where: { OR: [{ cnpj: data.cnpj }, { slug: data.slug }] },
    });
    if (exists) throw new ConflictException('CNPJ ou slug já cadastrado');

    return this.prisma.client.create({ data });
  }

  async delete(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException(`Cliente "${id}" não encontrado`);

    await this.prisma.site.deleteMany({ where: { clientId: id } });
    await this.prisma.clientTemplate.deleteMany({ where: { clientId: id } });
    await this.prisma.client.delete({ where: { id } });
    return { deleted: true };
  }
}

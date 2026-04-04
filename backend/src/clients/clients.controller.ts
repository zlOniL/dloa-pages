import { Body, Controller, Delete, Get, Param, Post, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ClientsService } from './clients.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    return this.clientsService.findAll(search, page, limit);
  }

  @Post()
  create(@Body() body: { name: string; cnpj: string; slug: string }) {
    return this.clientsService.create(body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.clientsService.delete(id);
  }
}

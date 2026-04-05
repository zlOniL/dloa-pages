import {
  Body, Controller, Delete, Get, Param, Patch, Post,
  Query, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { SitesService } from './sites.service';

@Controller()
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  // ── Templates ─────────────────────────────────────────────────────────────

  @Get('templates')
  getTemplates(@Query('clientId') clientId?: string) {
    return this.sitesService.findTemplates(clientId);
  }

  // ── Clients → Sites ───────────────────────────────────────────────────────

  @Get('clients/:clientId/sites')
  getSitesByClient(@Param('clientId') clientId: string) {
    return this.sitesService.findByClient(clientId);
  }

  // ── Sites (by id) ─────────────────────────────────────────────────────────

  @Get('sites/by-id/:id')
  findById(@Param('id') id: string) {
    return this.sitesService.findById(id);
  }

  @Get('sites/view/:clientSlug/:siteSlug')
  findByClientSlugAndSiteSlug(
    @Param('clientSlug') clientSlug: string,
    @Param('siteSlug') siteSlug: string,
  ) {
    return this.sitesService.findByClientSlugAndSiteSlug(clientSlug, siteSlug);
  }

  @Patch('sites/by-id/:id')
  updateSiteById(@Param('id') id: string, @Body() body: any) {
    return this.sitesService.updateSiteById(id, body);
  }

  @Patch('sites/by-id/:id/sections/:sectionId')
  updateSectionById(
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
    @Body() body: any,
  ) {
    return this.sitesService.updateSectionById(id, sectionId, body);
  }

  @Post('sites/by-id/:id/upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads'),
      filename: (_req, file, cb) => cb(null, `${uuidv4()}${extname(file.originalname)}`),
    }),
  }))
  uploadById(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/${file.filename}` };
  }

  @Post('sites')
  createSite(@Body() body: { clientId: string; templateId?: string; siteSlug: string; companyName: string; type?: string }) {
    return this.sitesService.createSite(body);
  }

  @Delete('sites/:id')
  deleteSite(@Param('id') id: string) {
    return this.sitesService.deleteSite(id);
  }

  // ── Sites (by slug — legacy) ──────────────────────────────────────────────

  @Get('sites/:slug')
  findOne(@Param('slug') slug: string) {
    return this.sitesService.findBySlug(slug);
  }

  @Patch('sites/:slug')
  updateSite(@Param('slug') slug: string, @Body() body: any) {
    return this.sitesService.updateSite(slug, body);
  }

  @Patch('sites/:slug/sections/:id')
  updateSection(@Param('slug') slug: string, @Param('id') id: string, @Body() body: any) {
    return this.sitesService.updateSection(slug, id, body);
  }

  @Post('sites/:slug/assets')
  createAsset(@Param('slug') slug: string, @Body() body: any) {
    return this.sitesService.createAsset(slug, body);
  }

  @Post('sites/:slug/upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads'),
      filename: (_req, file, cb) => cb(null, `${uuidv4()}${extname(file.originalname)}`),
    }),
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/${file.filename}` };
  }
}

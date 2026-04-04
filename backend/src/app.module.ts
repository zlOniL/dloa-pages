import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { SitesModule } from './sites/sites.module';
import { ClientsModule } from './clients/clients.module';

@Module({
  imports: [
    CacheModule.register({ isGlobal: true, ttl: 3600_000 }),
    SitesModule,
    ClientsModule,
  ],
})
export class AppModule {}

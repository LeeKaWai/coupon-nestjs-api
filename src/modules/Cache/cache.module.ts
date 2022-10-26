import { Module, DynamicModule, Global } from '@nestjs/common';

import { CacheService } from './cache.service';
import { CacheModuleOption } from './interfaces';

@Global()
@Module({})
export class CacheModule {
  static forRoot(options: CacheModuleOption): DynamicModule {
    return {
      global: true,
      module: CacheModule,
      providers: [
        {
          provide: CacheService,
          useFactory: async () => {
            const { CacheService } = await import('./engine/redis');
            return new CacheService(options);
          },
        },
      ],
      exports: [CacheService],
    };
  }
}

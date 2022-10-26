import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { JdModule } from './subModules/JD/jd.module';

import { TaobaoModule } from './subModules/Taobao/taobao.module';

@Module({
  imports: [JdModule, TaobaoModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService]
})
export class SearchModule {}

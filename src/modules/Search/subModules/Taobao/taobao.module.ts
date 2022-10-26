import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TaobaoService } from './taobao.service';

@Module({
  imports: [HttpModule],
  providers: [TaobaoService],
  exports: [TaobaoService],
})
export class TaobaoModule {}

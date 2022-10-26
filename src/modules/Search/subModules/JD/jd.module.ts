import { Module } from '@nestjs/common';
import { JdService } from './jd.service';

@Module({
  imports: [],
  providers: [JdService],
  exports: [JdService],
})
export class JdModule {}

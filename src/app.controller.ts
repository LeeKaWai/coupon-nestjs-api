import { Controller, Get } from '@nestjs/common';
import packageJson from '../package.json';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return `app: ${packageJson.name}@${packageJson.version}, runlint`;
  }
}

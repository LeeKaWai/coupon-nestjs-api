// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({
  path: `./configs/env/.env-${process.env.NODE_ENV || 'development'}`
});

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
import { AllExceptionsFilter, TransformInterceptor } from 'src/core/exceptions';
import { AppModule } from './app.module';
import * as packageJson from '../package.json';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      // enable class type conversion
      transformOptions: { enableImplicitConversion: true }
    })
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  // 启用gzip 压缩
  app.use(compression());

  await app.listen(process.env.PORT);
  console.log(packageJson);
  console.info(
    '%s run in [ %s ] successfully at port %s',
    packageJson.name,
    process.env.NODE_ENV || 'development',
    process.env.PORT
  );
}
bootstrap();

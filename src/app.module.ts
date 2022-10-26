import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// import { PaginatePlugin, CursorPaginatePlugin } from 'src/core';
// import MongodbHelper from 'src/core/database/mongodb/mongodb.helper';

import { CacheModule } from 'src/modules/Cache/cache.module';
import { SearchModule } from 'src/modules/Search/search.module';

import { AppController } from './app.controller';

@Module({
  imports: [
    // MongooseModule.forRoot(
    //   MongodbHelper.getConnectionString({
    //     hosts: [process.env.MONGODB_HOST],
    //     port: parseInt(process.env.MONGODB_PORT, 10),
    //     dbName: process.env.DATABASE,
    //     username: process.env.MONGODB_USERNAME,
    //     password: process.env.MONGODB_PASSWORD,
    //     isSRV: false,
    //     isSSL: false,
    //   }),
    //   {
    //     useCreateIndex: true,
    //     useNewUrlParser: true,
    //     useFindAndModify: false,
    //     useUnifiedTopology: true,
    //     connectionName: 'Database',
    //     connectionFactory: (connection) => {
    //       connection.plugin(PaginatePlugin);
    //       connection.plugin(CursorPaginatePlugin);
    //       return connection;
    //     },
    //   },
    // ),
    CacheModule.forRoot({
      url: process.env.REDIS_HOST,
      username: process.env.REDIS_USERNAME,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
    }),

    SearchModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

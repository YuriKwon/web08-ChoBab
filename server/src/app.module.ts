import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomModule } from '@room/room.module';
import * as Joi from 'joi';
import { SocketModule } from '@socket/socket.module';
import { MapModule } from '@map/map.module';
import { TaskModule } from '@task/task.module';
import { RestaurantModule } from '@restaurant/restaurant.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        MONGODB_USERNAME: Joi.string().required(),
        MONGODB_PASSWORD: Joi.string().required(),
        MONGODB_DB_NAME: Joi.string().required(),
        KAKAO_API_KEY: Joi.string().required(),
        NAVER_MAP_API_CLIENT_ID: Joi.string().required(),
        NAVER_MAP_API_CLIENT_SECRET: Joi.string().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: `mongodb+srv://${configService.get('MONGODB_USERNAME')}:${configService.get(
          'MONGODB_PASSWORD'
        )}@chobab.opfwdho.mongodb.net/${configService.get(
          'MONGODB_DB_NAME'
        )}?retryWrites=true&w=majority`,
      }),
      inject: [ConfigService],
    }),
    RoomModule,
    RestaurantModule,
    SocketModule,
    MapModule,
    TaskModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

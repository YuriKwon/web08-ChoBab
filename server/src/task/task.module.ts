import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomDynamic, RoomDynamicSchema, RoomSchema } from '@room/room.schema';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: RoomDynamic.name, schema: RoomDynamicSchema },
    ]),
  ],
  providers: [TaskService],
})
export class TaskModule {}

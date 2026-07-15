// Version: 1.0.0 | Date: 2026-07-14 00:00:00 | Updated: สร้าง RoomsModule
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomInfo } from '../domain/entities/room-info.entity';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoomInfo])],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}

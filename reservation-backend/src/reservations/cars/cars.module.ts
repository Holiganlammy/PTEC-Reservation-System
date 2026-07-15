// Version: 1.0.0 | Date: 2026-07-14 00:00:00 | Updated: สร้าง CarsModule
import { Module } from '@nestjs/common';
import { CarsController } from './cars.controller';
import { CarsService } from './cars.service';

@Module({
  controllers: [CarsController],
  providers: [CarsService],
})
export class CarsModule {}

// Version: 1.0.0 | Date: 2026-07-10 16:00:00 | Updated: สร้าง AuthModule สำหรับ proxy endpoint ไป Portal backend
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
})
export class AuthModule {}

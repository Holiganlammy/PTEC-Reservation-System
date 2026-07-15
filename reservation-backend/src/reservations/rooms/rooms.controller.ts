// Version: 1.0.0 | Date: 2026-07-14 00:00:00 | Updated: endpoint GET /rooms สำหรับหน้า select-type
import { Controller, Get } from '@nestjs/common';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  findActive() {
    return this.roomsService.findActive();
  }
}

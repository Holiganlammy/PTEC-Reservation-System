// Version: 1.0.0 | Date: 2026-07-14 00:00:00 | Updated: ดึงรายการห้องประชุมที่ active สำหรับหน้า select-type
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomInfo } from '../domain/entities/room-info.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(RoomInfo)
    private readonly roomInfoRepository: Repository<RoomInfo>,
  ) {}

  async findActive() {
    return this.roomInfoRepository.find({
      where: { active: true },
      relations: { roomCategary: true, images: true },
      order: { roomName: 'ASC' },
    });
  }
}

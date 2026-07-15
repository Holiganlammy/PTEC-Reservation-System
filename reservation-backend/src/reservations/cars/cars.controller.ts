// Version: 2.0.0 | Date: 2026-07-14 00:00:00 | Updated: รับ query param สำหรับ filter + pagination แทนการคืนทั้งหมด
import { Controller, Get, Query } from '@nestjs/common';
import { CarsService } from './cars.service';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  findPaginated(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '12',
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('seat') seat?: string,
  ) {
    return this.carsService.findPaginated({
      page: Math.max(1, Number(page) || 1),
      pageSize: Math.min(96, Math.max(1, Number(pageSize) || 12)),
      search,
      category,
      type,
      seat: seat !== undefined ? Number(seat) : undefined,
    });
  }

  @Get('filter-options')
  findFilterOptions() {
    return this.carsService.findFilterOptions();
  }
}

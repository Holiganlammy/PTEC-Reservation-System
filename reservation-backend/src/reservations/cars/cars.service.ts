// Version: 2.0.0 | Date: 2026-07-14 00:00:00 | Updated: ย้าย filter + pagination ไปทำที่ backend แทน fetch ทั้งหมดมาตัดฝั่ง frontend
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface CarListItem {
  car_infoid: number;
  car_infocode: string;
  starting_mile: number | null;
  car_infostatus_companny: boolean;
  car_categaryid: number;
  car_categary_name: string | null;
  car_typeid: number;
  car_typename: string | null;
  car_band: string | null;
  car_tier: string | null;
  car_color: string | null;
  car_remarks: string | null;
  rateoil: number | null;
  active: number;
  createby: number | null;
  createdate: Date | null;
  updateby: number | null;
  updatedate: Date | null;
  seat_count: number | null;
  image_url: string | null;
}

export interface CarQueryParams {
  page: number;
  pageSize: number;
  search?: string;
  category?: string;
  type?: string;
  seat?: number;
}

export interface CarFilterOptions {
  categories: string[];
  types: string[];
  seats: number[];
}

@Injectable()
export class CarsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  // ไม่มี FK ข้าม database ได้ ต้อง query ตรงด้วย three-part naming (ตาม claude.md)
  // ใช้งานได้ก็ต่อเมื่อ PTEC_OPS อยู่ SQL Server instance เดียวกับ PTEC_RESERVATION
  // และ login (DB_USERNAME) มีสิทธิ์อ่านข้าม database — ทดสอบแล้วว่าอ่านได้จริง
  async findPaginated(
    params: CarQueryParams
  ): Promise<{ data: CarListItem[]; total: number }> {
    const { page, pageSize, search, category, type, seat } = params;

    const conditions: string[] = ['ci.active = 1'];
    const values: unknown[] = [];

    if (search?.trim()) {
      const p = values.length;
      values.push(`%${search.trim()}%`);
      conditions.push(
        `(ci.car_band LIKE @${p} OR ci.car_tier LIKE @${p} OR ci.car_infocode LIKE @${p})`
      );
    }
    if (category) {
      values.push(category);
      conditions.push(`cc.car_categary_name = @${values.length - 1}`);
    }
    if (type) {
      values.push(type);
      conditions.push(`ct.car_typename = @${values.length - 1}`);
    }
    if (seat !== undefined) {
      values.push(seat);
      conditions.push(`ci.seat_count = @${values.length - 1}`);
    }

    const offsetParamIndex = values.length;
    values.push((page - 1) * pageSize);
    const fetchParamIndex = values.length;
    values.push(pageSize);

    const whereClause = conditions.join(' AND ');

    const rows: (CarListItem & { total_count: number })[] = await this.dataSource.query(
      `
      SELECT
        ci.car_infoid,
        ci.car_infocode,
        ci.starting_mile,
        ci.car_infostatus_companny,
        ci.car_categaryid,
        cc.car_categary_name,
        ci.car_typeid,
        ct.car_typename,
        ci.car_band,
        ci.car_tier,
        ci.car_color,
        ci.car_remarks,
        ci.rateoil,
        ci.active,
        ci.createby,
        ci.createdate,
        ci.updateby,
        ci.updatedate,
        ci.seat_count,
        img.image_url,
        COUNT(*) OVER() AS total_count
      FROM PTEC_OPS.dbo.Car_info ci
      LEFT JOIN PTEC_OPS.dbo.Car_Type ct ON ct.car_typeid = ci.car_typeid
      LEFT JOIN PTEC_OPS.dbo.Car_Categary cc ON cc.car_categaryid = ci.car_categaryid
      OUTER APPLY (
        SELECT TOP 1 image_url
        FROM PTEC_OPS.dbo.Car_Image
        WHERE car_infoid = ci.car_infoid
        ORDER BY car_image_id ASC
      ) img
      WHERE ${whereClause}
      ORDER BY ci.car_infocode ASC
      OFFSET @${offsetParamIndex} ROWS FETCH NEXT @${fetchParamIndex} ROWS ONLY
      `,
      values
    );

    const total = rows[0]?.total_count ?? 0;
    const data = rows.map(({ total_count: _total_count, ...rest }) => rest);

    return { data, total };
  }

  async findFilterOptions(): Promise<CarFilterOptions> {
    const [categories, types, seats] = await Promise.all([
      this.dataSource.query(
        `SELECT car_categary_name FROM PTEC_OPS.dbo.Car_Categary ORDER BY car_categary_name`
      ),
      this.dataSource.query(
        `SELECT car_typename FROM PTEC_OPS.dbo.Car_Type ORDER BY car_typename`
      ),
      this.dataSource.query(
        `SELECT DISTINCT seat_count FROM PTEC_OPS.dbo.Car_info WHERE seat_count IS NOT NULL ORDER BY seat_count`
      ),
    ]);

    return {
      categories: categories.map((r: { car_categary_name: string }) => r.car_categary_name),
      types: types.map((r: { car_typename: string }) => r.car_typename),
      seats: seats.map((r: { seat_count: number }) => r.seat_count),
    };
  }
}

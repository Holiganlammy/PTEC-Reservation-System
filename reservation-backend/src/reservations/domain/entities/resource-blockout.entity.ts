// Version: 1.0.0 | Date: 2026-07-14 09:30:00 | Updated: สร้าง entity resource_blockouts (ปิดใช้งานรถ/ห้องชั่วคราว)
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RoomInfo } from './room-info.entity';
import type { ResourceType } from './reservation.entity';

@Entity('resource_blockouts')
export class ResourceBlockout {
  @PrimaryGeneratedColumn({ name: 'blockout_id' })
  blockoutId!: number;

  @Column({ name: 'resource_type', type: 'varchar', length: 10 })
  resourceType!: ResourceType;

  // ไม่มี FK จริง — car_infoid อ้างอิงตาราง Car_Info ที่อยู่คนละ database (PTEC_OPS)
  @Column({ name: 'car_infoid', type: 'int', nullable: true })
  carInfoId!: number | null;

  @Column({ name: 'room_infoid', type: 'int', nullable: true })
  roomInfoId!: number | null;

  @Column({ name: 'start_datetime', type: 'datetime' })
  startDatetime!: Date;

  @Column({ name: 'end_datetime', type: 'datetime' })
  endDatetime!: Date;

  @Column({ name: 'reason', type: 'nvarchar', length: 500 })
  reason!: string;

  @Column({ name: 'active', type: 'bit', default: 1 })
  active!: boolean;

  @Column({ name: 'created_at', type: 'datetime', default: () => 'getdate()' })
  createdAt!: Date;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy!: number | null;

  @Column({ name: 'updated_at', type: 'datetime', nullable: true })
  updatedAt!: Date | null;

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy!: number | null;

  @Column({ name: 'deleted_by', type: 'int', nullable: true })
  deletedBy!: number | null;

  @Column({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt!: Date | null;

  @ManyToOne(() => RoomInfo)
  @JoinColumn({ name: 'room_infoid' })
  room!: RoomInfo | null;
}

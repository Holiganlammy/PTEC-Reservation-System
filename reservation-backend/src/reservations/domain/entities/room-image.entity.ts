// Version: 1.0.0 | Date: 2026-07-10 14:00:00 | Updated: สร้าง entity Room_Image ตาม dbo.reservation.sql
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoomInfo } from './room-info.entity';

@Entity('Room_Image')
export class RoomImage {
  @PrimaryGeneratedColumn({ name: 'room_image_id' })
  roomImageId!: number;

  @Column({ name: 'room_infoid', type: 'int' })
  roomInfoId!: number;

  @Column({ name: 'name', type: 'nvarchar', length: 200, nullable: true })
  name!: string | null;

  @Column({ name: 'image_url', type: 'nvarchar', length: 500, nullable: true })
  imageUrl!: string | null;

  @Column({ name: 'active', type: 'bit', default: 1 })
  active!: boolean;

  @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'getdate()',
    nullable: true,
  })
  createdAt!: Date | null;

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

  @ManyToOne(() => RoomInfo, (room) => room.images)
  @JoinColumn({ name: 'room_infoid' })
  room!: RoomInfo;
}

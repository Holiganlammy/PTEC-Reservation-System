// Version: 1.0.0 | Date: 2026-07-10 14:00:00 | Updated: สร้าง entity Room_Info ตาม dbo.reservation.sql
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoomCategary } from './room-categary.entity';
import { RoomImage } from './room-image.entity';

@Entity('Room_Info')
export class RoomInfo {
  @PrimaryGeneratedColumn({ name: 'room_infoid' })
  roomInfoId!: number;

  @Column({ name: 'room_infocode', type: 'varchar', length: 50 })
  roomInfoCode!: string;

  @Column({ name: 'room_name', type: 'nvarchar', length: 200 })
  roomName!: string;

  @Column({ name: 'room_categaryid', type: 'int' })
  roomCategaryId!: number;

  @Column({ name: 'building', type: 'nvarchar', length: 100, nullable: true })
  building!: string | null;

  @Column({ name: 'floor', type: 'nvarchar', length: 50, nullable: true })
  floor!: string | null;

  @Column({ name: 'branch_code', type: 'varchar', length: 20, nullable: true })
  branchCode!: string | null;

  @Column({ name: 'capacity', type: 'int', nullable: true })
  capacity!: number | null;

  @Column({ name: 'equipment', type: 'nvarchar', length: 500, nullable: true })
  equipment!: string | null;

  @Column({
    name: 'room_remarks',
    type: 'nvarchar',
    length: 'MAX',
    nullable: true,
  })
  roomRemarks!: string | null;

  @Column({ name: 'active', type: 'bit', default: 1 })
  active!: boolean;

  @Column({ name: 'created_at', type: 'datetime', nullable: true })
  createdAt!: Date | null;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy!: number | null;

  @Column({ name: 'updated_at', type: 'datetime', nullable: true })
  updatedAt!: Date | null;

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy!: number | null;

  @ManyToOne(() => RoomCategary, (categary) => categary.rooms)
  @JoinColumn({ name: 'room_categaryid' })
  roomCategary!: RoomCategary;

  @OneToMany(() => RoomImage, (image) => image.room)
  images!: RoomImage[];
}

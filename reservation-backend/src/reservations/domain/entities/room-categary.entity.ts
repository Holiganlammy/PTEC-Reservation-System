// Version: 1.0.0 | Date: 2026-07-10 14:00:00 | Updated: สร้าง entity Room_Categary ตาม dbo.reservation.sql
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RoomInfo } from './room-info.entity';

@Entity('Room_Categary')
export class RoomCategary {
  @PrimaryGeneratedColumn({ name: 'room_categaryid' })
  roomCategaryId!: number;

  @Column({ name: 'room_categary_name', type: 'nvarchar', length: 100 })
  roomCategaryName!: string;

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

  @OneToMany(() => RoomInfo, (room) => room.roomCategary)
  rooms!: RoomInfo[];
}

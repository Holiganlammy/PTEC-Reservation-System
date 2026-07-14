// Version: 1.0.0 | Date: 2026-07-10 14:00:00 | Updated: สร้าง entity Room_Categary ตาม dbo.reservation.sql
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RoomInfo } from './room-info.entity';

@Entity('Room_Categary')
export class RoomCategary {
  @PrimaryGeneratedColumn({ name: 'room_categaryid' })
  roomCategaryId!: number;

  @Column({ name: 'room_categary_name', type: 'nvarchar', length: 100 })
  roomCategaryName!: string;

  @OneToMany(() => RoomInfo, (room) => room.roomCategary)
  rooms!: RoomInfo[];
}

// Version: 1.0.0 | Date: 2026-07-10 14:00:00 | Updated: สร้าง entity reservations ตาม dbo.reservation.sql
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RoomInfo } from './room-info.entity';

export type ResourceType = 'CAR' | 'ROOM';

export type ReservationStatus =
  | 'PENDING'
  | 'CANCELLED'
  | 'ADMIN_CONFIRMED'
  | 'APPROVED'
  | 'COMPLETED'
  | 'REJECTED_SUPERVISOR'
  | 'REJECTED_ADMIN';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn({ name: 'reservation_id' })
  reservationId: number;

  @Column({ name: 'resource_type', type: 'varchar', length: 10 })
  resourceType: ResourceType;

  // ไม่มี FK จริงใน DB — car_infoid อ้างอิงตาราง Car_Info ที่อยู่คนละ database (PTEC_OPS)
  // ต้อง validate เองที่ service layer
  @Column({ name: 'car_infoid', type: 'int', nullable: true })
  carInfoId: number | null;

  @Column({ name: 'room_infoid', type: 'int', nullable: true })
  roomInfoId: number | null;

  // requester/supervisor user_id อ้างอิง User table ใน Portal — ไม่มี FK ข้าม database
  @Column({ name: 'requester_user_id', type: 'int' })
  requesterUserId: number;

  @Column({ name: 'supervisor_user_id', type: 'int', nullable: true })
  supervisorUserId: number | null;

  @Column({ name: 'purpose', type: 'nvarchar', length: 500 })
  purpose: string;

  @Column({ name: 'start_datetime', type: 'datetime' })
  startDatetime: Date;

  @Column({ name: 'end_datetime', type: 'datetime' })
  endDatetime: Date;

  @Column({ name: 'destination', type: 'nvarchar', length: 300, nullable: true })
  destination: string | null;

  @Column({ name: 'passenger_count', type: 'int', nullable: true })
  passengerCount: number | null;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'PENDING' })
  status: ReservationStatus;

  @Column({ name: 'created_at', type: 'datetime', default: () => 'getdate()' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number | null;

  @Column({ name: 'updated_at', type: 'datetime', nullable: true })
  updatedAt: Date | null;

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy: number | null;

  // FK จริงมีแค่ room_infoid (อยู่ใน database เดียวกัน)
  @ManyToOne(() => RoomInfo)
  @JoinColumn({ name: 'room_infoid' })
  room: RoomInfo | null;
}

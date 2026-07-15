// Version: 1.0.0 | Date: 2026-07-10 14:00:00 | Updated: สร้าง entity reservation_admin_actions ตาม dbo.reservation.sql
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';

export type AdminAction = 'CONFIRMED' | 'REJECTED';

@Entity('reservation_admin_actions')
export class ReservationAdminAction {
  @PrimaryGeneratedColumn({ name: 'action_id' })
  actionId!: number;

  @Column({ name: 'reservation_id', type: 'int' })
  reservationId!: number;

  @Column({ name: 'admin_user_id', type: 'int' })
  adminUserId!: number;

  @Column({ name: 'action', type: 'varchar', length: 20 })
  action!: AdminAction;

  @Column({ name: 'reason', type: 'nvarchar', length: 500, nullable: true })
  reason!: string | null;

  @Column({ name: 'action_at', type: 'datetime', default: () => 'getdate()' })
  actionAt!: Date;

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

  @ManyToOne(() => Reservation)
  @JoinColumn({ name: 'reservation_id' })
  reservation!: Reservation;
}

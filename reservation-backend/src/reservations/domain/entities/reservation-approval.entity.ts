// Version: 1.0.0 | Date: 2026-07-10 14:00:00 | Updated: สร้าง entity reservation_approvals ตาม dbo.reservation.sql
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Reservation } from './reservation.entity';

export type ApprovalAction = 'APPROVED' | 'REJECTED';

@Entity('reservation_approvals')
export class ReservationApproval {
  @PrimaryGeneratedColumn({ name: 'approval_id' })
  approvalId: number;

  @Column({ name: 'reservation_id', type: 'int' })
  reservationId: number;

  @Column({ name: 'supervisor_user_id', type: 'int' })
  supervisorUserId: number;

  @Column({ name: 'action', type: 'varchar', length: 20 })
  action: ApprovalAction;

  @Column({ name: 'comment', type: 'nvarchar', length: 500, nullable: true })
  comment: string | null;

  @Column({ name: 'action_at', type: 'datetime', default: () => 'getdate()' })
  actionAt: Date;

  @Column({ name: 'created_at', type: 'datetime', nullable: true })
  createdAt: Date | null;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number | null;

  @Column({ name: 'updated_at', type: 'datetime', nullable: true })
  updatedAt: Date | null;

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy: number | null;

  @ManyToOne(() => Reservation)
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;
}

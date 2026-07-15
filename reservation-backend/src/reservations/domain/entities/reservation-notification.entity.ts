// Version: 1.0.0 | Date: 2026-07-10 14:00:00 | Updated: สร้าง entity reservation_notifications ตาม dbo.reservation.sql
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Reservation } from './reservation.entity';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'LINE';

@Entity('reservation_notifications')
export class ReservationNotification {
  @PrimaryGeneratedColumn({ name: 'notification_id' })
  notificationId: number;

  @Column({ name: 'reservation_id', type: 'int' })
  reservationId: number;

  @Column({ name: 'recipient_user_id', type: 'int' })
  recipientUserId: number;

  @Column({ name: 'notification_type', type: 'varchar', length: 30 })
  notificationType: string;

  @Column({ name: 'channel', type: 'varchar', length: 20, default: 'IN_APP' })
  channel: NotificationChannel;

  @Column({ name: 'message', type: 'nvarchar', length: 500 })
  message: string;

  @Column({ name: 'is_read', type: 'bit', default: 0 })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'datetime', nullable: true })
  readAt: Date | null;

  @Column({ name: 'sent_at', type: 'datetime', nullable: true })
  sentAt: Date | null;

  @Column({ name: 'created_at', type: 'datetime', nullable: true })
  createdAt: Date | null;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number | null;

  @Column({ name: 'updated_at', type: 'datetime', nullable: true })
  updatedAt: Date | null;

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy: number | null;

  @Column({ name: 'deleted_by', type: 'int', nullable: true })
  deletedBy: number | null;

  @Column({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Reservation)
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;
}

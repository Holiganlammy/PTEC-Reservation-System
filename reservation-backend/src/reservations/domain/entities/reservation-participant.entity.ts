// Version: 1.0.0 | Date: 2026-07-10 14:00:00 | Updated: สร้าง entity reservation_participants ตาม dbo.reservation.sql
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity('reservation_participants')
export class ReservationParticipant {
  @PrimaryGeneratedColumn({ name: 'participant_id' })
  participantId: number;

  @Column({ name: 'reservation_id', type: 'int' })
  reservationId: number;

  // พนักงานในระบบ (อ้างอิง User ใน Portal, ไม่มี FK ข้าม database)
  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  // บุคคลภายนอก — กรอกเองเมื่อไม่มี user_id
  @Column({ name: 'full_name', type: 'nvarchar', length: 200, nullable: true })
  fullName: string | null;

  @Column({ name: 'email', type: 'varchar', length: 50, nullable: true })
  email: string | null;

  @Column({ name: 'depid', type: 'int', nullable: true })
  depId: number | null;

  @Column({ name: 'created_at', type: 'datetime', default: () => 'getdate()' })
  createdAt: Date;

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

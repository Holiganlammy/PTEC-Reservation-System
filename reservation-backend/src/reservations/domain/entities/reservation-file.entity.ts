// Version: 1.0.0 | Date: 2026-07-14 09:30:00 | Updated: สร้าง entity reservation_files (แนบเอกสารประกอบการจอง)
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// 'RESERVATION' = แนบกับ reservations.reservation_id (ตอนนี้มีแบบเดียว เผื่ออนาคตขยาย type อื่น)
export type ReservationFileType = 'RESERVATION';

@Entity('reservation_files')
export class ReservationFile {
  @PrimaryGeneratedColumn({ name: 'file_id' })
  fileId: number;

  @Column({ name: 'file_type', type: 'varchar', length: 30 })
  fileType: ReservationFileType;

  // polymorphic ตาม file_type — ไม่ผูก FK ตายตัว
  @Column({ name: 'reference_id', type: 'int' })
  referenceId: number;

  @Column({ name: 'file_name', type: 'nvarchar', length: 255 })
  fileName: string;

  @Column({ name: 'file_path', type: 'nvarchar', length: 'MAX' as unknown as number })
  filePath: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize: number | null;

  @Column({ name: 'mime_type', type: 'nvarchar', length: 100, nullable: true })
  mimeType: string | null;

  @Column({ name: 'uploaded_by', type: 'int', nullable: true })
  uploadedBy: number | null;

  @Column({ name: 'uploaded_at', type: 'datetime', default: () => 'getdate()', nullable: true })
  uploadedAt: Date | null;

  @Column({ name: 'active', type: 'bit', default: 1, nullable: true })
  active: boolean | null;

  @Column({ name: 'description', type: 'nvarchar', length: 'MAX' as unknown as number, nullable: true })
  description: string | null;

  @Column({ name: 'deleted_by', type: 'int', nullable: true })
  deletedBy: number | null;

  @Column({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date | null;
}

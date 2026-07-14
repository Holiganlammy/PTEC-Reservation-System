// Version: 1.0.0 | Date: 2026-07-10 14:00:00 | Updated: ต่อ TypeOrmModule เข้ากับ PTEC_RESERVATION (SQL Server)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomCategary } from './reservations/domain/entities/room-categary.entity';
import { RoomInfo } from './reservations/domain/entities/room-info.entity';
import { RoomImage } from './reservations/domain/entities/room-image.entity';
import { Reservation } from './reservations/domain/entities/reservation.entity';
import { ReservationAdminAction } from './reservations/domain/entities/reservation-admin-action.entity';
import { ReservationApproval } from './reservations/domain/entities/reservation-approval.entity';
import { ReservationParticipant } from './reservations/domain/entities/reservation-participant.entity';
import { ReservationNotification } from './reservations/domain/entities/reservation-notification.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 1433),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      options: {
        encrypt: process.env.DB_ENCRYPT !== 'false',
        trustServerCertificate: true,
      },
      // ห้ามเปิด synchronize — ตาราง/schema ถูกสร้างไว้แล้วจริงใน PTEC_RESERVATION
      synchronize: false,
      entities: [
        RoomCategary,
        RoomInfo,
        RoomImage,
        Reservation,
        ReservationAdminAction,
        ReservationApproval,
        ReservationParticipant,
        ReservationNotification,
      ],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

// src/modules/system-notification/system-notification.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemNotificationService } from './system-notification.service';
import { SystemNotificationController } from './system-notification.controller';

// Importar entidades MySQL
import { SystemNotification } from '../../models/mysql/system-notification.entity';
import { User } from '../../models/mysql/user.entity';

@Module({
  imports: [
    // Configuración TypeORM para entidades MySQL
    TypeOrmModule.forFeature([
      SystemNotification,
      User
    ]),
  ],
  controllers: [SystemNotificationController],
  providers: [SystemNotificationService],
  exports: [SystemNotificationService], // Exportar para usar en otros módulos
})
export class SystemNotificationModule {}
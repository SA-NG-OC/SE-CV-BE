import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsListener } from './notification.listener';

@Module({
    imports: [AuthModule],
    providers: [NotificationsGateway, NotificationsService, NotificationsRepository, NotificationsListener],
    controllers: [NotificationsController],
    exports: [NotificationsGateway, NotificationsService],
})
export class NotificationsModule {

}

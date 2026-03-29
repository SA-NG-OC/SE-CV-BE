import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './repositories/notifications.repository';
import { NotificationsListener } from './notification.listener';
import { I_NOTIFICATIONS_REPOSITORY } from './notification.token';

@Module({
    imports: [AuthModule],
    providers: [NotificationsGateway, NotificationsService, NotificationsListener, {
        provide: I_NOTIFICATIONS_REPOSITORY,
        useClass: NotificationsRepository,
    }],
    controllers: [NotificationsController],
    exports: [NotificationsGateway, NotificationsService],
})
export class NotificationsModule {

}

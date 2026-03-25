import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsGateway } from './notifications.gateway';
import { CreateNotificationDto, MarkReadDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
    constructor(
        private readonly repo: NotificationsRepository,
        private readonly gateway: NotificationsGateway
    ) {

    }

    async createAndNotify(data: CreateNotificationDto) {
        const notification = await this.repo.create(data);
        this.gateway.sendToUser(data.user_id, 'new_notification', notification);

        return notification;
    }
    async createAndNotifyToAdmin(data: Omit<CreateNotificationDto, 'user_id'>) {
        const adminIds = await this.repo.getAdminId();

        if (!adminIds || adminIds.length === 0) {
            throw new NotFoundException('Không tìm thấy admin');
        }

        const notificationsToSave = adminIds.map((adminId) => ({
            ...data,
            user_id: adminId,
        }));

        const savedNotifications = await this.repo.createMany(notificationsToSave);

        this.gateway.sendToUsers(adminIds, 'new_notification', {
            ...data,
            created_at: new Date().toISOString(),
        });

        return savedNotifications;
    }
    async getUserNotifications(userId: number) {
        return this.repo.findByUserId(userId);
    }

    async markAsRead(userId: number, dto: MarkReadDto) {
        return this.repo.markAsRead(userId, dto.notificationIds);
    }

    async deleteNotification(userId: number, id: number) {
        return this.repo.delete(userId, id);
    }

    async deleteAllNotifications(userId: number) {
        return this.repo.deleteAll(userId);
    }

}

import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { INotificationsRepository } from './repositories/notifications-repository.interface';
import { NotificationsGateway } from './notifications.gateway';
import { CreateNotificationDto, MarkReadDto } from './dto/notification.dto';
import { I_NOTIFICATIONS_REPOSITORY } from './notification.token';
import { I_FOLLOWED_COMPANY_REPOSITORY, type IFollowedCompanyRepository } from '../follow/repositories/follow-repository.interface';

@Injectable()
export class NotificationsService {
    constructor(
        @Inject(I_NOTIFICATIONS_REPOSITORY)
        private readonly repo: INotificationsRepository,
        @Inject(I_FOLLOWED_COMPANY_REPOSITORY)
        private readonly followedCompanyRepo: IFollowedCompanyRepository,
        private readonly gateway: NotificationsGateway,
    ) { }

    async createAndNotify(data: CreateNotificationDto) {
        const notification = await this.repo.create(data);
        this.gateway.sendToUser(data.user_id, 'notification', notification);

        return notification;
    }
    private async createAndEmit(
        userIds: number[],
        data: Omit<CreateNotificationDto, 'user_id'>,
    ) {
        if (!userIds.length) return [];

        const notifications = userIds.map((id) => ({
            ...data,
            user_id: id,
        }));

        const saved = await this.repo.createMany(notifications);

        this.gateway.sendToUsers(userIds, 'notification', {
            ...data,
            created_at: new Date().toISOString(),
        });

        return saved;
    }

    async createAndNotifyToAdmin(data: Omit<CreateNotificationDto, 'user_id'>) {
        const adminIds = await this.repo.getAdminId();

        if (!adminIds.length) {
            throw new NotFoundException('Không tìm thấy admin');
        }

        return this.createAndEmit(adminIds, data);
    }

    async notifyToFollowers(
        companyId: number,
        data: Omit<CreateNotificationDto, 'user_id'>,
    ) {
        const followerIds =
            await this.followedCompanyRepo.getFollowerUserIdsByCompanyId(companyId);

        return this.createAndEmit(followerIds, data);
    }

    async getUserNotifications(userId: number, page: number, limit: number) {
        const notifications = await this.repo.findByUserId(userId, page, limit);
        return notifications;
    }

    async getUnreadCount(userId: number) {
        const [data] = await this.repo.getUnreadCount(userId);
        return data;
    }

    async getCompanyUserId(companyId: number) {
        return await this.repo.getCompanyUserId(companyId);
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
// notifications.repository.ts
import { Inject, Injectable } from '@nestjs/common';
import * as schema from '../../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, inArray, desc, count } from 'drizzle-orm';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import { Role } from 'src/common/types/role.enum';
import { INotificationsRepository } from './notifications-repository.interface';
@Injectable()
export class NotificationsRepository implements INotificationsRepository {
    constructor(
        @Inject(DATABASE_CONNECTION) private readonly db: NodePgDatabase<typeof schema>,
    ) { }

    async create(data: any) {
        const [notification] = await this.db
            .insert(schema.notifications)
            .values(data)
            .returning();
        return notification;
    }

    async getAdminId(): Promise<number[]> {
        const admin = await this.db
            .select({ admin_id: schema.users.user_id })
            .from(schema.users)
            .where(eq(schema.users.role_id, Role.ADMIN));
        const adminId: number[] = admin.map((admin) => admin.admin_id);
        return adminId;
    }

    // notifications.repository.ts
    async createMany(data: any[]) {
        return await this.db
            .insert(schema.notifications)
            .values(data)
            .returning();
    }

    async findByUserId(userId: number) {
        return await this.db.query.notifications.findMany({
            where: eq(schema.notifications.user_id, userId),
            orderBy: [desc(schema.notifications.created_at)],
        });
    }

    async getUnreadCount(userId: number) {
        const result = await this.db.select({ count: count() })
            .from(schema.notifications)
            .where(
                and(
                    eq(schema.notifications.user_id, userId),
                    eq(schema.notifications.is_read, false)
                )
            )
        return result;
    }

    async markAsRead(userId: number, notificationIds?: number[]) {
        const condition = notificationIds
            ? and(eq(schema.notifications.user_id, userId), inArray(schema.notifications.notification_id, notificationIds))
            : eq(schema.notifications.user_id, userId);

        return await this.db
            .update(schema.notifications)
            .set({ is_read: true })
            .where(condition)
            .returning();
    }

    async delete(userId: number, notificationId: number) {
        return await this.db
            .delete(schema.notifications)
            .where(
                and(
                    eq(schema.notifications.user_id, userId),
                    eq(schema.notifications.notification_id, notificationId)
                )
            );
    }

    async deleteAll(userId: number) {
        return await this.db
            .delete(schema.notifications)
            .where(eq(schema.notifications.user_id, userId));
    }
}
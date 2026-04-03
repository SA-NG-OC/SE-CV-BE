import { PaginationResponse } from "src/common/types/PaginationResponse";

export interface INotificationsRepository {
    create(data: any): Promise<any>;

    getAdminId(): Promise<number[]>;

    createMany(data: any[]): Promise<any[]>;

    findByUserId(userId: number, page: number, limit: number): Promise<PaginationResponse<any>>;

    getUnreadCount(userId: number): Promise<{ unread_count: number }[]>;

    markAsRead(userId: number, notificationIds?: number[]): Promise<any[]>;

    delete(userId: number, notificationId: number): Promise<any>;

    deleteAll(userId: number): Promise<any>;
}
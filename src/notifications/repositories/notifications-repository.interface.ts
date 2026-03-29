export interface INotificationsRepository {
    create(data: any): Promise<any>;

    getAdminId(): Promise<number[]>;

    createMany(data: any[]): Promise<any[]>;

    findByUserId(userId: number): Promise<any[]>;

    getUnreadCount(userId: number): Promise<{ count: number }[]>;

    markAsRead(userId: number, notificationIds?: number[]): Promise<any[]>;

    delete(userId: number, notificationId: number): Promise<any>;

    deleteAll(userId: number): Promise<any>;
}
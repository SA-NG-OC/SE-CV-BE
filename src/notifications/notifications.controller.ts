import { Controller, Req, UseGuards, HttpStatus, Patch, HttpCode, Body, Delete, Param } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { Get } from '@nestjs/common';
import { MarkReadDto } from './dto/notification.dto';
import ResponseSuccess from 'src/common/types/responseSuccess';
import { ParseIntPipe } from '@nestjs/common';
import {
    GetMyNotificationsDocs,
    GetUnreadCountDocs,
    MarkAsReadDocs,
    DeleteNotificationDocs
} from './decorators';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly service: NotificationsService) { }

    @Get()
    @GetMyNotificationsDocs()
    async getMyNotifications(@Req() req) {
        const userId = req.user.userId;
        const notifications = await this.service.getUserNotifications(userId);
        return new ResponseSuccess('Lấy thông tin thành công', { notifications });
    }

    @Get('unread-count')
    @GetUnreadCountDocs()
    async getUnreadCount(@Req() req) {
        const userId = req.user.userId;
        const notifications = await this.service.getUserNotifications(userId);
        const count = notifications.filter(n => !n.is_read).length;
        return new ResponseSuccess('Lấy thông tin thành công', { unread_count: count });
    }

    @Patch('mark-read')
    @MarkAsReadDocs()
    @HttpCode(HttpStatus.OK)
    async markAsRead(
        @Req() req,
        @Body() dto: MarkReadDto
    ) {
        const userId = req.user.userId;
        await this.service.markAsRead(userId, dto);
        return new ResponseSuccess('Cập nhật trạng thái thành công', {});
    }

    @Delete(':id')
    @DeleteNotificationDocs()
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteNotification(
        @Req() req,
        @Param('id', ParseIntPipe) id: number
    ) {
        const userId = req.user.userId;
        await this.service.deleteNotification(userId, id);
        return new ResponseSuccess('Xóa thông báo thành công', {});
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteAllNotifications(@Req() req) {
        const userId = req.user.userId;
        await this.service.deleteAllNotifications(userId);
        return new ResponseSuccess('Xóa tất cả thông báo thành công', {});
    }
}

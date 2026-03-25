import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';

export const GetMyNotificationsDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Lấy danh sách thông báo',
        description: 'Trả về toàn bộ thông báo của người dùng hiện tại.'
    }),
    ApiOkResponse({
        example: {
            success: true,
            message: "Lấy thông tin thành công",
            data: [
                {
                    notification_id: 6,
                    user_id: 1,
                    type: "ADMIN_REVIEW_REQUIRED",
                    title: "Yêu cầu phê duyệt công ty mới",
                    message: "Người dùng 11 vừa đăng ký công ty: TechNova Solutions",
                    link: null,
                    is_read: false,
                    created_at: "2026-03-24T23:35:28.403Z"
                },
                {
                    notification_id: 3,
                    user_id: 1,
                    type: "ADMIN_REVIEW_REQUIRED",
                    title: "Yêu cầu phê duyệt công ty mới",
                    message: "Người dùng 2 vừa đăng ký công ty: TechNova Solutions",
                    link: null,
                    is_read: false,
                    created_at: "2026-03-24T23:27:39.244Z"
                }
            ]
        },
    }),
);
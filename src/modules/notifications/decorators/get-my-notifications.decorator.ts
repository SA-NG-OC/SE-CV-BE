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
            data: {
                data: [
                    {
                        notification_id: 7,
                        user_id: 2000,
                        type: "COMPANY_CREATED",
                        title: "Đăng ký công ty thành công",
                        message: 'Yêu cầu tạo công ty "TechNova Solutions" đang chờ duyệt.',
                        link: null,
                        is_read: false,
                        created_at: "2026-03-30T03:31:41.558Z"
                    }
                ],
                meta: {
                    currentPage: 1,
                    itemsPerPage: 10,
                    totalItems: 1,
                    totalPages: 1
                }
            }
        }
    }),
);
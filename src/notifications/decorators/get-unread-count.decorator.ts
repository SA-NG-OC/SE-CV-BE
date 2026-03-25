import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

export const GetUnreadCountDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Lấy số lượng thông báo chưa đọc' }),
    ApiOkResponse({
        description: 'Lấy số lượng thành công.',
        schema: {
            example: {
                success: true,
                message: "Lấy thông tin thành công",
                data: {
                    unread_count: 2
                }
            }
        }
    }),
);
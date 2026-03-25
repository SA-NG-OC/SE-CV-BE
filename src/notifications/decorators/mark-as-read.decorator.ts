import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { MarkReadDto } from '../dto/notification.dto';

export const MarkAsReadDocs = () => applyDecorators(
    ApiBearerAuth(),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Đánh dấu thông báo là đã đọc. Nếu không có ID thông báo nào được gửi lên, đánh dấu tất cả thông báo là đã đọc.' }),
    ApiBody({ type: MarkReadDto }),
    ApiOkResponse({
        description: 'Cập nhật trạng thái thành công.',
        schema: { example: { success: true, message: 'Lấy thông tin thành công', data: {} } }
    }),
);
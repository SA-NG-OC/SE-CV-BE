import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiNoContentResponse, ApiParam } from '@nestjs/swagger';

export const DeleteNotificationDocs = () => applyDecorators(
    ApiBearerAuth(),
    HttpCode(HttpStatus.NO_CONTENT),
    ApiOperation({ summary: 'Xóa một thông báo' }),
    ApiParam({ name: 'id', description: 'ID của thông báo cần xóa', type: Number }),
    ApiNoContentResponse({
        description: 'Xóa thông báo thành công.',
    }),
);
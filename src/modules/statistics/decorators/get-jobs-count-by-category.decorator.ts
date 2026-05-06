import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

export function GetJobsCountByCategoryDocs() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Thống kê job theo category (Admin)',
            description:
                'API dùng cho admin để xem tổng số lượng job trong hệ thống theo từng danh mục (category), không giới hạn theo công ty.',
        }),
        ApiOkResponse({
            description: 'Lấy thống kê job theo danh mục thành công',
        }),
    );
}
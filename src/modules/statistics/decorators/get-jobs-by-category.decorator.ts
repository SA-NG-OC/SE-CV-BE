import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

export function GetJobsByCategoryDocs() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Thống kê job theo category (Company)',
            description:
                'API dùng để hiển thị số lượng job của công ty theo từng danh mục (category), phục vụ biểu đồ phân bố công việc.',
        }),
        ApiOkResponse({
            description: 'Lấy thống kê job theo category thành công',
        }),
    );
}
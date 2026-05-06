import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

export function GetApplicationsPerMonthDocs() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Số lượng application theo tháng',
            description:
                'API dùng để hiển thị tổng số lượng application theo từng tháng trong 12 tháng gần nhất, phục vụ biểu đồ thống kê.',
        }),
        ApiOkResponse({
            description: 'Lấy số lượng application theo tháng thành công',
        }),
    );
}
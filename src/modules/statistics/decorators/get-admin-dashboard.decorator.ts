import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

export function GetAdminDashboardDocs() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Dashboard admin chi tiết',
            description:
                'API dùng cho dashboard admin để hiển thị tổng số company, student, application và job posting trong hệ thống.',
        }),
        ApiOkResponse({
            description: 'Lấy dashboard admin thành công',
        }),
    );
}
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
            example: {
                success: true,
                message: "Lấy thống kê admin thành công",
                data: {
                    totalCompanies: 6,
                    totalStudents: 10,
                    totalApplications: 12,
                    totalJobPostings: 21,
                },
            }
        }),
    );
}
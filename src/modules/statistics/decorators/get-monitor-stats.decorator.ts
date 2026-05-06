// get-dashboard-stats.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

export const GetMonitorStatsDocs = () =>
    applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Lấy thống kê dashboard',
            description:
                'Trả về các số liệu tổng quan bao gồm tổng công ty, điểm trung bình, tổng ứng viên và số lượng đã tuyển',
        }),
        ApiOkResponse({
            description: 'Lấy thống kê thành công',
            example: {
                success: true,
                message: 'Lấy thống kê thành công',
                data: {
                    totalCompanies: 8,
                    avgRating: 4.4,
                    totalApplications: 1281,
                    totalPassed: 249,
                },
            },
        }),
    );
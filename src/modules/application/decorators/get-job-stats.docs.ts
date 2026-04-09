import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

export const GetJobStatsDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Thống kê ứng tuyển của công việc',
        description: 'Xem số lượng ứng viên theo từng trạng thái. Yêu cầu role COMPANY.',
    }),
    ApiQuery({ name: 'jobId', required: false, type: Number }),
    ApiResponse({
        status: 200, description: 'Lấy thông tin thành công', example: {
            success: true,
            message: "Lấy thông tin thành công",
            data: {
                total: 0,
                byStatus: {
                    submitted: 0,
                    interviewing: 0,
                    passed: 0,
                    rejected: 0
                }
            }
        }
    }),
);
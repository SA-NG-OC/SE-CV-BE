import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const GetMyStatsDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Thống kê ứng tuyển cá nhân',
        description: 'Xem số lượng đơn đã nộp, đang phỏng vấn. Yêu cầu role STUDENT.',
    }),
    ApiResponse({
        status: 200, description: 'Lấy thông tin thành công', example: {
            success: true,
            message: "Lấy thông tin thành công",
            data: {
                total: 1,
                byStatus: {
                    submitted: 1,
                    interviewing: 0,
                    passed: 0,
                    rejected: 0
                }
            }
        }
    }),
);
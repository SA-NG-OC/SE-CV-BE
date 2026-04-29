import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const GetInvitationStatsDocs = () =>
    applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Thống kê lời mời của công ty',
            description: 'Lấy tổng số lời mời và phân bố theo trạng thái. Yêu cầu role COMPANY.',
        }),
        ApiResponse({
            status: 200,
            description: 'Lấy thông tin thành công',
            example: {
                success: true,
                message: 'Lấy thông tin thành công',
                data: {
                    total: 1,
                    byStatus: {
                        pending: 1,
                        accepted: 0,
                        rejected: 0,
                        expired: 0,
                    },
                },
            },
        }),
        ApiResponse({
            status: 401,
            description: 'Unauthorized',
            example: {
                statusCode: 401,
                message: 'Unauthorized',
            },
        }),
        ApiResponse({
            status: 403,
            description: 'Forbidden - Không đúng role',
            example: {
                statusCode: 403,
                message: 'Forbidden resource',
            },
        }),
    );
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

export const InviteCandidateDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Gửi lời mời ứng tuyển',
        description: 'Công ty chủ động mời sinh viên ứng tuyển. Yêu cầu role COMPANY.',
    }),
    ApiBody({
        schema: {
            type: 'object',
            required: ['jobId', 'studentId'],
            properties: {
                jobId: { type: 'integer', example: 1 },
                studentId: { type: 'integer', example: 10 },
                message: { type: 'string', maxLength: 1000, example: 'Chúng tôi thấy profile của bạn rất phù hợp...' },
            },
        },
    }),
    ApiResponse({
        status: 201, description: 'Gửi lời mời thành công', example: {
            success: true,
            message: "Gửi lời mời ứng tuyển thành công",
            data: {
                props: {
                    id: 3,
                    jobId: 8,
                    studentId: 100,
                    message: "Chúng tôi thấy bạn phù hợp với vị trí Backend Intern",
                    status: "pending",
                    createdAt: "2026-04-09T01:58:06.812Z",
                    updatedAt: "2026-04-09T01:58:06.812Z"
                }
            }
        }
    }),
);
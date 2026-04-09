import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

export const RespondInvitationDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Phản hồi lời mời ứng tuyển',
        description: 'Chấp nhận hoặc từ chối lời mời. Yêu cầu role STUDENT. action truyền vào là accept hoặc reject',
    }),
    ApiParam({ name: 'id', type: Number }),
    ApiBody({
        schema: {
            type: 'object',
            required: ['action'],
            properties: {
                action: { type: 'string', enum: ['accept', 'reject'], example: 'accept' },
                cvUrl: { type: 'string', format: 'url', example: 'https://cv.com/file.pdf' },
            },
        },
    }),
    ApiResponse({
        status: 200, description: 'Xử lý phản hồi thành công', example: {
            success: true,
            message: "Đã từ chối lời mời ứng tuyển",
            data: {}
        }
    }),
);
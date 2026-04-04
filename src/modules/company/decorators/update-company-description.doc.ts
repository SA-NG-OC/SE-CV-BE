import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiBody } from '@nestjs/swagger';

export const UpdateCompanyDescriptionDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Cập nhật mô tả công ty',
        description: 'Cập nhật phần mô tả giới thiệu công ty. Yêu cầu role COMPANY.',
    }),
    ApiBody({
        description: 'Nội dung mô tả cần cập nhật',
        schema: {
            type: 'object',
            properties: {
                description: { type: 'string', example: 'Mô tả chi tiết về công ty...' },
            },
        },
    }),
    ApiOkResponse({
        description: 'Cập nhật mô tả thành công',
        example: {
            success: true,
            message: 'Cập nhật mô tả công ty thành công',
            data: {},
        },
    }),
);
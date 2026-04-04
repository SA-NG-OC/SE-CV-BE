import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiBody } from '@nestjs/swagger';

export const UpdateCompanyDetailDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Cập nhật thông tin chi tiết công ty',
        description: 'Cập nhật các thông tin chi tiết. Yêu cầu role COMPANY.',
    }),
    ApiBody({
        description: 'Thông tin chi tiết cần cập nhật',
        schema: {
            type: 'object',
            properties: {
                industry: { type: 'string', example: 'Mô tả chi tiết về công ty...' },
                company_size: { type: 'string', example: '60-100' },
                address: { type: 'string', example: 'Số 5 Hà Văn Toàn' },
            },
        },
    }),
    ApiOkResponse({
        description: 'Cập nhật thông tin chi tiết thành công',
        example: {
            success: true,
            message: 'Cập nhật thông tin chi tiết công ty thành công',
            data: {},
        },
    }),
);
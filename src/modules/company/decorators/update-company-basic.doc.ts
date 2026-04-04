import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiBody } from '@nestjs/swagger';

export const UpdateCompanyBasicDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Cập nhật thông tin cơ bản công ty',
        description: 'Cập nhật các trường thông tin cơ bản như tên, quy mô, ngành nghề,... Yêu cầu role COMPANY.',
    }),
    ApiBody({
        description: 'Thông tin cơ bản cần cập nhật',
        schema: {
            type: 'object',
            properties: {
                company_name: { type: 'string', example: 'TechNova Solutions' },
                slogan: { type: 'string', example: 'Vì một tương lai tương sáng' }
            },
        },
    }),
    ApiOkResponse({
        description: 'Cập nhật thông tin cơ bản thành công',
        example: {
            success: true,
            message: 'Cập nhật thông tin cơ bản công ty thành công',
            data: {},
        },
    }),
);
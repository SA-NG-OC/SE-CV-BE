import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiBody } from '@nestjs/swagger';

export const UpdateCompanyContactDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Cập nhật thông tin liên hệ công ty',
        description: 'Cập nhật email, số điện thoại, website,... Yêu cầu role COMPANY.',
    }),
    ApiBody({
        description: 'Thông tin liên hệ cần cập nhật',
        schema: {
            type: 'object',
            properties: {
                // bổ sung các field từ UpdateCompanyContactDto
                contact_email: { type: 'string', example: 'contact@technova.com' },
                contact_phone: { type: 'string', example: '0901234567' },
                website: { type: 'string', example: 'https://technova.com' },
            },
        },
    }),
    ApiOkResponse({
        description: 'Cập nhật thông tin liên hệ thành công',
        example: {
            success: true,
            message: 'Cập nhật thông tin liên hệ thành công',
            data: {},
        },
    }),
);
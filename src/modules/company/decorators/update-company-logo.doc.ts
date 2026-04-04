import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';

export const UpdateCompanyLogoDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiOperation({
        summary: 'Cập nhật logo công ty',
        description: 'Upload file logo mới để thay thế logo hiện tại. Yêu cầu role COMPANY.',
    }),
    ApiBody({
        description: 'File logo mới',
        schema: {
            type: 'object',
            required: ['logo'],
            properties: {
                logo: { type: 'file', format: 'binary', description: 'File ảnh logo' },
            },
        },
    }),
    ApiOkResponse({
        description: 'Cập nhật logo thành công',
        example: {
            success: true,
            message: 'Cập nhật logo công ty thành công',
            data: {},
        },
    }),
);
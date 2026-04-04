import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';

export const UpdateCompanyCoverDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiOperation({
        summary: 'Cập nhật ảnh bìa công ty',
        description: 'Upload file ảnh bìa mới để thay thế ảnh bìa hiện tại. Yêu cầu role COMPANY.',
    }),
    ApiBody({
        description: 'File ảnh bìa mới',
        schema: {
            type: 'object',
            required: ['coverImage'],
            properties: {
                coverImage: { type: 'file', format: 'binary', description: 'File ảnh bìa' },
            },
        },
    }),
    ApiOkResponse({
        description: 'Cập nhật ảnh bìa thành công',
        example: {
            success: true,
            message: 'Cập nhật ảnh bìa công ty thành công',
            data: {},
        },
    }),
);
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';

export const UploadOfficeImagesDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiOperation({
        summary: 'Thêm ảnh văn phòng',
        description: 'Upload thêm ảnh văn phòng cho công ty (tối đa 6 ảnh mỗi lần). Yêu cầu role COMPANY.',
    }),
    ApiBody({
        description: 'Danh sách file ảnh văn phòng',
        schema: {
            type: 'object',
            required: ['images'],
            properties: {
                images: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                    description: 'Tối đa 6 ảnh văn phòng',
                },
            },
        },
    }),
    ApiOkResponse({
        description: 'Upload ảnh văn phòng thành công',
        example: {
            success: true,
            message: 'Tải ảnh văn phòng thành công',
            data: {},
        },
    }),
);
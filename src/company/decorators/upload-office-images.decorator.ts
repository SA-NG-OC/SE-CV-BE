// decorators/upload-office-images.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { OfficeImageListDataResponse } from './company-swagger.response';

const UploadOfficeImagesDocs = () =>
    applyDecorators(
        ApiBearerAuth('access-token'),
        ApiConsumes('multipart/form-data'),
        ApiOperation({
            summary: 'Thêm ảnh văn phòng',
            description: 'Yêu cầu role **COMPANY**. Upload tối đa 6 ảnh dưới field `images`.',
        }),
        ApiBody({
            schema: {
                type: 'object',
                required: ['images'],
                properties: {
                    images: {
                        type: 'array',
                        items: { type: 'file', format: 'binary' },
                        description: 'Tối đa 6 ảnh văn phòng',
                    },
                },
            },
        }),
        ApiOkResponse({ description: 'Tải ảnh văn phòng thành công.', type: OfficeImageListDataResponse }),
    );

export default UploadOfficeImagesDocs;
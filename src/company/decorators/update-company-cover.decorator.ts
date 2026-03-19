// decorators/update-company-cover.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CompanyDataResponse } from './company-swagger.response';

const UpdateCompanyCoverDocs = () =>
    applyDecorators(
        ApiBearerAuth('access-token'),
        ApiConsumes('multipart/form-data'),
        ApiOperation({
            summary: 'Cập nhật ảnh bìa công ty',
            description: 'Yêu cầu role **COMPANY**. Upload file ảnh dưới field `coverImage`.',
        }),
        ApiBody({
            schema: {
                type: 'object',
                required: ['coverImage'],
                properties: {
                    coverImage: { type: 'file', format: 'binary', description: 'File ảnh bìa mới' },
                },
            },
        }),
        ApiOkResponse({ description: 'Cập nhật ảnh bìa công ty thành công.', type: CompanyDataResponse }),
    );

export default UpdateCompanyCoverDocs;
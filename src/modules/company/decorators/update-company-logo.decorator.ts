// decorators/update-company-logo.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CompanyDataResponse } from './company-swagger.response';

const UpdateCompanyLogoDocs = () =>
    applyDecorators(
        ApiBearerAuth('access-token'),
        ApiConsumes('multipart/form-data'),
        ApiOperation({
            summary: 'Cập nhật logo công ty',
            description: 'Yêu cầu role **COMPANY**. Upload file ảnh dưới field `logo`.',
        }),
        ApiBody({
            schema: {
                type: 'object',
                required: ['logo'],
                properties: {
                    logo: { type: 'file', format: 'binary', description: 'File logo mới' },
                },
            },
        }),
        ApiOkResponse({ description: 'Cập nhật logo công ty thành công.', type: CompanyDataResponse }),
    );

export default UpdateCompanyLogoDocs;
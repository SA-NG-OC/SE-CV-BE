// decorators/update-company-description.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CompanyDataResponse } from './company-swagger.response';

const UpdateCompanyDescriptionDocs = () =>
    applyDecorators(
        ApiBearerAuth('access-token'),
        ApiOperation({
            summary: 'Cập nhật mô tả công ty',
            description: 'Yêu cầu role **COMPANY**. Cập nhật trường `description`.',
        }),
        ApiOkResponse({ description: 'Cập nhật mô tả công ty thành công.', type: CompanyDataResponse }),
    );

export default UpdateCompanyDescriptionDocs;
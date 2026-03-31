// decorators/update-company-basic.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CompanyDataResponse } from './company-swagger.response';

const UpdateCompanyBasicDocs = () =>
    applyDecorators(
        ApiBearerAuth('access-token'),
        ApiOperation({
            summary: 'Cập nhật thông tin cơ bản công ty',
            description:
                'Yêu cầu role **COMPANY**. ' +
                'Các trường có thể cập nhật: `company_name`, `slogan`, `website`, `company_size`.',
        }),
        ApiOkResponse({ description: 'Cập nhật thông tin cơ bản thành công.', type: CompanyDataResponse }),
    );

export default UpdateCompanyBasicDocs;
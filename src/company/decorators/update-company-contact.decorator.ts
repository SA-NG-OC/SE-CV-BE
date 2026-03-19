// decorators/update-company-contact.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CompanyDataResponse } from './company-swagger.response';

const UpdateCompanyContactDocs = () =>
    applyDecorators(
        ApiBearerAuth('access-token'),
        ApiOperation({
            summary: 'Cập nhật thông tin liên hệ công ty',
            description:
                'Yêu cầu role **COMPANY**. ' +
                'Các trường có thể cập nhật: `contact_email`, `contact_phone`, `address`, `city`, `district`.',
        }),
        ApiOkResponse({ description: 'Cập nhật thông tin liên hệ thành công.', type: CompanyDataResponse }),
    );

export default UpdateCompanyContactDocs;
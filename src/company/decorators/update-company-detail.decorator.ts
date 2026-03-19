// decorators/update-company-detail.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CompanyDataResponse } from './company-swagger.response';

const UpdateCompanyDetailDocs = () =>
    applyDecorators(
        ApiBearerAuth('access-token'),
        ApiOperation({
            summary: 'Cập nhật thông tin chi tiết công ty',
            description: 'Yêu cầu role **COMPANY**. Ngành nghề, loại hình công ty, v.v.',
        }),
        ApiOkResponse({ description: 'Cập nhật thông tin chi tiết thành công.', type: CompanyDataResponse }),
    );

export default UpdateCompanyDetailDocs;
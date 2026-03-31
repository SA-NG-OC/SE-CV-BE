// decorators/get-company-by-id.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CompanyDataResponse } from './company-swagger.response';

const GetCompanyByIdDocs = () =>
    applyDecorators(
        ApiBearerAuth('access-token'),
        ApiOperation({
            summary: 'Lấy thông tin công ty theo ID',
            description:
                'Yêu cầu role **ADMIN** hoặc **STUDENT**. ' +
                'Admin xem được mọi trạng thái; Student chỉ thấy công ty `APPROVED`.',
        }),
        ApiParam({ name: 'companyId', type: Number, description: 'ID của công ty' }),
        ApiOkResponse({ description: 'Lấy thông tin công ty thành công.', type: CompanyDataResponse }),
    );

export default GetCompanyByIdDocs;
// decorators/get-my-company.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CompanyDataResponse } from './company-swagger.response';

const GetMyCompanyDocs = () =>
    applyDecorators(
        ApiBearerAuth('access-token'),
        ApiOperation({
            summary: 'Lấy thông tin công ty của tài khoản đang đăng nhập',
            description: 'Yêu cầu role **COMPANY**.',
        }),
        ApiOkResponse({ description: 'Lấy thông tin công ty thành công.', type: CompanyDataResponse }),
    );

export default GetMyCompanyDocs;
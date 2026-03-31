// decorators/get-general-information.decorator.ts
import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

const GetGeneralInformationDocs = () => applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiBearerAuth('access-token'),
    ApiOperation({
        summary: 'Lấy thông tin tổng quan',
        description: 'Yêu cầu `Bearer Token`. Chỉ dành cho quyền `ADMIN`. Trả về các thống kê chung về sinh viên.',
    }),
    ApiOkResponse({
        description: 'Lấy thông tin thành công.',
        schema: {
            example: {
                success: true, message: 'Lấy thông tin thành công', data: {
                    totalStudents: 1,
                    studying: 1,
                    graduated: 0
                }
            }
        },
    }),
);

export default GetGeneralInformationDocs;
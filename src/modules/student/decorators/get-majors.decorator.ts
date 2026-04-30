// decorators/get-majors.decorator.ts
import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

const GetMajorsDocs = () => applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiBearerAuth('access-token'),
    ApiOperation({
        summary: 'Lấy danh sách chuyên ngành',
        description: 'Yêu cầu `Bearer Token`. Trả về danh sách ID và tên các chuyên ngành hiện có.',
    }),
    ApiOkResponse({
        description: 'Lấy danh sách thành công.',
        schema: {
            example: {
                success: true,
                message: "Lấy danh sách chuyên ngành thành công",
                data: [
                    {
                        majorId: 100,
                        majorName: "Công nghệ thông tin"
                    },
                    {
                        majorId: 101,
                        majorName: "Kỹ thuật phần mềm"
                    },
                    {
                        majorId: 102,
                        majorName: "Hệ thống thông tin"
                    },
                    {
                        majorId: 103,
                        majorName: "Khoa học máy tính"
                    }
                ]
            }
        },
    }),
);

export default GetMajorsDocs;
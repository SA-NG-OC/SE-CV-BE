// decorators/get-students.decorator.ts
import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiQuery } from '@nestjs/swagger';

const GetStudentsDocs = () => applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiBearerAuth('access-token'),
    ApiOperation({
        summary: 'Lấy danh sách sinh viên',
        description: 'Yêu cầu `Bearer Token`. Hỗ trợ phân trang, lọc theo trạng thái và tìm kiếm từ khóa. Chỉ dành cho quyền `ADMIN`.',
    }),
    ApiQuery({ name: 'page', required: false, type: String, description: 'Số trang (mặc định: 1)', example: '1' }),
    ApiQuery({ name: 'limit', required: false, type: String, description: 'Số lượng kết quả trên mỗi trang (mặc định: 10)', example: '10' }),
    ApiQuery({ name: 'status', required: false, enum: ['STUDYING', 'GRADUATED', 'DROPPED_OUT'], description: 'Lọc theo trạng thái học tập của sinh viên' }),
    ApiQuery({ name: 'keyword', required: false, type: String, description: 'Từ khóa tìm kiếm (theo tên, MSSV, ...)' }),
    ApiOkResponse({
        description: 'Lấy danh sách sinh viên thành công.',
        schema: {
            example: {
                success: true,
                message: "Lấy thông tin thành công",
                data: {
                    data: [
                        {
                            studentId: 1,
                            fullName: "Nguyễn Văn A",
                            studentCode: "2021601234",
                            email: "nguyenvana@student.edu.vn",
                            currentYear: 4,
                            enrollmentYear: 2021,
                            studentStatus: "STUDYING",
                            totalApplications: 0
                        }
                    ],
                    meta: {
                        currentPage: 1,
                        itemsPerPage: 10,
                        totalItem: 1,
                        totalPages: 1
                    }
                }
            }
        },
    }),
);

export default GetStudentsDocs;
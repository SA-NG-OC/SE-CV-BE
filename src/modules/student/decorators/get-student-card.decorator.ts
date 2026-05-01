import { applyDecorators, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery } from "@nestjs/swagger";

export const GetStudentsCardDocs = () => applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiBearerAuth('access-token'),
    ApiOperation({
        summary: 'Lấy danh sách sinh viên kèm bộ lọc - Dùng cho Company tìm kiếm ứng viên',
        description: 'Yêu cầu quyền COMPANY. Hỗ trợ lọc đa năng.',
    }),

    // --- KHAI BÁO CÁC QUERY PARAMS Ở ĐÂY ---

    ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Trang hiện tại' }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Số lượng bản ghi mỗi trang' }),

    ApiQuery({
        name: 'search',
        required: false,
        type: String,
        description: 'Tìm kiếm theo tên sinh viên',
        example: 'Nguyễn Văn A'
    }),

    ApiQuery({
        name: 'majorId',
        required: false,
        type: Number,
        description: 'Lọc theo ID ngành học'
    }),

    ApiQuery({
        name: 'years',
        required: false,
        isArray: true, // Quan trọng: Đánh dấu đây là mảng
        description: 'Lọc theo năm học (1, 2, 3, 4) hoặc trạng thái tốt nghiệp (GRADUATED)',
        example: [4, 'GRADUATED']
    }),

    ApiQuery({
        name: 'minGpa',
        required: false,
        type: Number,
        description: 'Lọc GPA từ mức này trở lên (0.0 - 4.0)',
        example: 3.2
    }),

    ApiQuery({
        name: 'skillIds',
        required: false,
        isArray: true,
        type: Number,
        description: 'Mảng ID các kỹ năng cần tìm',
        example: [1, 5, 10]
    }),

    ApiQuery({
        name: 'isOpenToWork',
        required: false,
        type: Boolean,
        description: 'Chỉ hiển thị những sinh viên đang bật chế độ tìm việc'
    }),

    ApiOkResponse({
        description: 'Lấy danh sách sinh viên thành công.',
        schema: {
            example: {
                success: true,
                message: "Lấy danh sách sinh viên thành công",
                data: {
                    data: [
                        {
                            studentId: 100,
                            fullName: "Nguyễn Văn A",
                            avatarUrl: null,
                            currentYear: 4,
                            gpa: "3.45",
                            studentStatus: 'GRADUATED',
                            isOpenToWork: true,
                            skills: ["React", "Node.js", "TypeScript"]
                        }
                    ],
                    meta: {
                        totalItems: 1,
                        itemsPerPage: 10,
                        totalPages: 1,
                        currentPage: 1
                    }
                }
            }
        }
    }),
);
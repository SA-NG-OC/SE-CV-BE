import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

export const GetJobListDocs = () => applyDecorators(
    ApiOperation({
        summary: 'Lấy danh sách tin tuyển dụng của công ty (dạng rút gọn)',
        description: 'Trả về danh sách tin tuyển dụng (gồm jobId và jobTitle) có phân trang của công ty đang đăng nhập. Yêu cầu có JWT token.',
    }),
    ApiBearerAuth(),
    ApiQuery({
        name: 'page',
        type: Number,
        required: false,
        example: 1,
        description: 'Số trang hiện tại (mặc định là 1)'
    }),
    ApiQuery({
        name: 'limit',
        type: Number,
        required: false,
        example: 10,
        description: 'Số lượng bản ghi trên mỗi trang (mặc định là 10)'
    }),
    ApiOkResponse({
        description: 'Lấy thông tin thành công',
        example: {
            success: true,
            message: "Lấy thông tin thành công",
            data: {
                data: [
                    {
                        jobId: 7,
                        jobTitle: "Hahahahahahahahahaha"
                    },
                    {
                        jobId: 8,
                        jobTitle: "Frontend Developer Intern 3.0"
                    }
                ],
                meta: {
                    currentPage: 1,
                    itemsPerPage: 10,
                    totalItems: 2,
                    totalPages: 1
                }
            }
        },
    }),
);
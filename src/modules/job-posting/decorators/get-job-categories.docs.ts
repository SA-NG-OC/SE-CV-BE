import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';

export const GetJobCategoriesDocs = () => applyDecorators(
    ApiOperation({
        summary: 'Lấy danh sách danh mục công việc',
        description: 'Trả về toàn bộ danh mục công việc dùng cho form đăng tuyển. Không yêu cầu xác thực.',
    }),
    ApiOkResponse({
        description: 'Lấy danh mục thành công',
        example: {
            success: true,
            message: "Lấy thông tin thành công",
            data: [
                {
                    categoryId: 1,
                    categoryName: "Software Development"
                },
                {
                    categoryId: 2,
                    categoryName: "Data & AI"
                },
                {
                    categoryId: 3,
                    categoryName: "DevOps & Cloud"
                },
                {
                    categoryId: 4,
                    categoryName: "Mobile Development"
                },
                {
                    categoryId: 5,
                    categoryName: "UI/UX Design"
                }
            ]
        },
    }),
);
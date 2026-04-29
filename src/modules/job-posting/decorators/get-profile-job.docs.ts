import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

export const GetProfileJobDocs = () => applyDecorators(
    ApiOperation({
        summary: 'Lấy danh sách tin tuyển dụng của công ty (trang profile)',
        description: 'Trả về danh sách tin tuyển dụng có phân trang theo companyId. Nếu là sinh viên sẽ chỉ lấy được những tin tuyển dụng đang hoạt động',
    }),
    ApiParam({ name: 'companyId', type: Number, description: 'ID của công ty', example: 1 }),
    ApiQuery({ name: 'page', type: Number, example: 1 }),
    ApiQuery({ name: 'limit', type: Number, example: 10 }),
    ApiOkResponse({
        description: 'Lấy dữ liệu thành công',
        example: {
            success: true,
            message: "Lấy dữ liệu thành công",
            data: {
                data: [
                    {
                        jobId: 9,
                        jobTitle: "Frontend Developer Intern 2.0",
                        city: "Hà Tĩnh",
                        categoryId: 1,
                        status: "rejected",
                        salaryMin: 3000000,
                        salaryMax: 5000000,
                        salaryType: "RANGE",
                        isSalaryNegotiable: false,
                        applicationDeadline: "2026-08-01",
                    },
                ],
                meta: {
                    currentPage: 1,
                    itemsPerPage: 10,
                    totalItems: 1,
                    totalPages: 1,
                },
            },
        },
    }),
);
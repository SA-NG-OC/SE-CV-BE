import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

export const GetProfileJobDocs = () => applyDecorators(
    ApiOperation({
        summary: 'Lấy danh sách tin tuyển dụng của công ty (trang profile)',
        description: 'Trả về danh sách tin tuyển dụng có phân trang theo companyId. Không yêu cầu xác thực.',
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
                        jobId: 7,
                        jobTitle: "Hahahahahahahahahaha",
                        city: null,
                        salaryMin: null,
                        salaryMax: null,
                        salaryType: null,
                        isSalaryNegotiable: true,
                        approvedAt: null
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
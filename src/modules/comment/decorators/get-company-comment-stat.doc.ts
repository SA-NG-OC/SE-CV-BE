import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiParam } from '@nestjs/swagger';

export const GetCompanyCommentStatDocs = () =>
    applyDecorators(
        ApiBearerAuth(),

        ApiOperation({
            summary: 'Admin xem thống kê đánh giá của công ty',
            description: `
- ADMIN: truyền companyId để xem
- (Có thể mở rộng COMPANY: tự lấy companyId từ token)
      `,
        }),

        ApiParam({
            name: 'companyId',
            type: Number,
            required: true,
            example: 7,
            description: 'ID công ty cần xem thống kê',
        }),

        ApiOkResponse({
            description: 'Đánh giá được tải thành công',
            example: {
                success: true,
                message: "Dữ liệu được tải thành công",
                data: {
                    totalComments: 1,
                    averageRating: 4,
                    distribution: [
                        {
                            rating: 1,
                            count: 0,
                            percentage: 0,
                        },
                        {
                            rating: 2,
                            count: 0,
                            percentage: 0,
                        },
                        {
                            rating: 3,
                            count: 1,
                            percentage: 0.5,
                        },
                        {
                            rating: 4,
                            count: 1,
                            percentage: 0.5,
                        },
                        {
                            rating: 5,
                            count: 0,
                            percentage: 0,
                        },
                    ],
                },
            }
        }),
    );
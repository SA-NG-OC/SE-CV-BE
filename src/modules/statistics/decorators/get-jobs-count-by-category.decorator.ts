import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

export function GetJobsCountByCategoryDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Thống kê job theo category (Admin)',
      description:
        'API dùng cho admin để xem tổng số lượng job trong hệ thống theo từng danh mục (category), không giới hạn theo công ty.',
    }),
    ApiOkResponse({
      description: 'Lấy thống kê job theo danh mục thành công',
      example: {
        success: true,
        message: 'Lấy thống kê job theo danh mục thành công',
        data: [
          {
            categoryId: 1,
            categoryName: 'Khác',
            totalJobs: 7,
          },
          {
            categoryId: 101,
            categoryName: 'Data & AI',
            totalJobs: 5,
          },
          {
            categoryId: 102,
            categoryName: 'DevOps & Cloud',
            totalJobs: 4,
          },
          {
            categoryId: 103,
            categoryName: 'Mobile Development',
            totalJobs: 3,
          },
          {
            categoryId: 104,
            categoryName: 'UI/UX Design',
            totalJobs: 2,
          },
        ],
      },
    }),
  );
}

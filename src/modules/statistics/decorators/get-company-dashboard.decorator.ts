import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

export function GetCompanyDashboardDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Dashboard công ty',
      description:
        'API dùng cho trang dashboard của nhà tuyển dụng để hiển thị các số liệu trong tháng như số job mới, số ứng tuyển mới, số đánh giá và số ứng viên đã pass.',
    }),
    ApiOkResponse({
      description: 'Lấy dashboard công ty thành công',
      example: {
        success: true,
        message: 'Lấy thống kê thành công',
        data: {
          totalJobs: 0,
          totalApplications: 0,
          totalReviews: 0,
          totalHired: 0,
        },
      },
    }),
  );
}

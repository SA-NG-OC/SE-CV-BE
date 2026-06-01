import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

export function GetApplicationsPerMonthDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Số lượng application theo tháng',
      description:
        'API dùng để hiển thị tổng số lượng application theo từng tháng trong 12 tháng gần nhất, phục vụ biểu đồ thống kê.',
    }),
    ApiOkResponse({
      description: 'Lấy số lượng application theo tháng thành công',
      example: {
        success: true,
        message: 'Lấy số lượng application theo tháng thành công',
        data: [
          {
            month: '2025-06',
            totalApplications: 0,
          },
          {
            month: '2025-07',
            totalApplications: 0,
          },
          {
            month: '2025-08',
            totalApplications: 0,
          },
          {
            month: '2025-09',
            totalApplications: 0,
          },
          {
            month: '2025-10',
            totalApplications: 0,
          },
          {
            month: '2025-11',
            totalApplications: 0,
          },
          {
            month: '2025-12',
            totalApplications: 0,
          },
          {
            month: '2026-01',
            totalApplications: 0,
          },
          {
            month: '2026-02',
            totalApplications: 0,
          },
          {
            month: '2026-03',
            totalApplications: 0,
          },
          {
            month: '2026-04',
            totalApplications: 12,
          },
          {
            month: '2026-05',
            totalApplications: 0,
          },
        ],
      },
    }),
  );
}

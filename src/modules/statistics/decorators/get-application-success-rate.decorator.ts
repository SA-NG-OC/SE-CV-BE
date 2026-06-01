import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

export function GetApplicationSuccessRateDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Tỉ lệ ứng tuyển thành công theo tháng',
      description:
        'API dùng để hiển thị tỉ lệ application thành công (approved) theo từng tháng trong 12 tháng gần nhất, phục vụ biểu đồ phân tích hiệu quả tuyển dụng.',
    }),
    ApiOkResponse({
      description: 'Lấy tỉ lệ application thành công thành công',
      example: {
        success: true,
        message:
          'Lấy tỉ lệ application thành công 12 tháng gần nhất thành công',
        data: [
          {
            month: '2025-06',
            successRate: 0,
          },
          {
            month: '2025-07',
            successRate: 0,
          },
          {
            month: '2025-08',
            successRate: 0,
          },
          {
            month: '2025-09',
            successRate: 0,
          },
          {
            month: '2025-10',
            successRate: 0,
          },
          {
            month: '2025-11',
            successRate: 0,
          },
          {
            month: '2025-12',
            successRate: 0,
          },
          {
            month: '2026-01',
            successRate: 0,
          },
          {
            month: '2026-02',
            successRate: 0,
          },
          {
            month: '2026-03',
            successRate: 0,
          },
          {
            month: '2026-04',
            successRate: 16.67,
          },
          {
            month: '2026-05',
            successRate: 0,
          },
        ],
      },
    }),
  );
}

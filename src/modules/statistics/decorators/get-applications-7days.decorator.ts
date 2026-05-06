import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

export function GetApplications7DaysDocs() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Thống kê ứng tuyển 7 ngày',
            description:
                'API dùng để vẽ biểu đồ số lượng ứng tuyển theo từng ngày trong 7 ngày gần nhất của một công ty.',
        }),
        ApiOkResponse({
            description: 'Lấy thống kê ứng tuyển 7 ngày thành công',
        }),
    );
}
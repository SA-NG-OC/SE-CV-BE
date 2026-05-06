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
        }),
    );
}
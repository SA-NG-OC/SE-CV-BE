import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

export function GetTopCompaniesDocs() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Top công ty có nhiều job nhất',
            description:
                'API dùng cho admin để lấy danh sách top 5 công ty có số lượng tin tuyển dụng nhiều nhất trong hệ thống.',
        }),
        ApiOkResponse({
            description: 'Lấy top công ty thành công',
        }),
    );
}
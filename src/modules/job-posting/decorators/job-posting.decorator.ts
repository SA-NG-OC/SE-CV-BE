import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiQuery } from '@nestjs/swagger';

export const GetAdminJobStatsDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Lấy thống kê tin tuyển dụng cho Admin',
        description: 'Thống kê: Chờ duyệt, Đã duyệt hôm nay, Đã từ chối, Tổng tin.'
    }),
    ApiOkResponse({
        description: 'Lấy thống kê thành công',
        schema: {
            example: {
                success: true,
                message: 'Lấy thống kê thành công',
                data: {
                    pending: 3,
                    approvedToday: 12,
                    rejected: 3,
                    total: 8
                }
            }
        }
    }),
);

// Decorator cho thống kê (số liệu 6 - 4 - 1 - 1 trong ảnh của bạn)
export const GetJobStatsDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Lấy thống kê tin tuyển dụng',
        description: 'Trả về số lượng tin: Tổng, Đang hoạt động, Tạm ẩn, Đã đóng.'
    }),
    ApiOkResponse({
        description: 'Lấy thống kê thành công',
        schema: {
            example: {
                success: true,
                message: 'Lấy thống kê thành công',
                data: {
                    total: 6,
                    active: 4,
                    restricted: 1,
                    closed: 1
                }
            }
        }
    }),
);
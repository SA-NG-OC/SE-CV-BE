import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiParam, ApiBearerAuth, ApiNotFoundResponse, ApiForbiddenResponse } from '@nestjs/swagger';

export const ToggleJobActiveDocs = () => applyDecorators(
    ApiOperation({
        summary: 'Ẩn hoặc Bỏ ẩn tin tuyển dụng',
        description: 'Chuyển đổi qua lại giữa trạng thái **Active** (Công khai) và **Hidden** (Ẩn). ' +
            'Nếu tin đang hiện sẽ bị ẩn đi, nếu đang ẩn sẽ được hiển thị lại. ' +
            'Yêu cầu quyền Company và phải là chủ sở hữu của tin tuyển dụng này.',
    }),
    ApiBearerAuth(),
    ApiParam({
        name: 'id',
        type: Number,
        description: 'ID của tin tuyển dụng cần thay đổi trạng thái',
        example: 1
    }),
    ApiOkResponse({
        description: 'Cập nhật trạng thái thành công',
        example: {
            success: true,
            message: "Cập nhật trạng thái thành công",
            data: {}
        },
    }),
    ApiForbiddenResponse({
        description: 'Bạn không có quyền chỉnh sửa tin tuyển dụng này (không phải chủ sở hữu)',
    }),
    ApiNotFoundResponse({
        description: 'Không tìm thấy tin tuyển dụng với ID đã cung cấp',
    }),
);
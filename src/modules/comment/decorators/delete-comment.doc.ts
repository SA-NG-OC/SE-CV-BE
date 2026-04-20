import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiParam } from '@nestjs/swagger';

export const DeleteCommentDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Sinh viên xóa đánh giá' }),
    ApiParam({ name: 'id', type: Number, description: 'ID của comment' }),
    ApiOkResponse({
        description: 'Xóa thành công',
        example: {
            success: true,
            message: "Xóa đánh giá thành công",
            data: {},
        }
    }),
);
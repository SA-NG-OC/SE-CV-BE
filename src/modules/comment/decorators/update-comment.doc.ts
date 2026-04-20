import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UpdateCommentDto } from '../dto/update-comment.dto';

export const UpdateCommentDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Sinh viên cập nhật đánh giá' }),
    ApiParam({ name: 'id', type: Number, description: 'ID của comment' }),
    ApiBody({ type: UpdateCommentDto }),
    ApiOkResponse({
        description: 'Cập nhật thành công',
        example: {
            success: true,
            message: "Cập nhật đánh giá thành công",
            data: {
                id: 1,
                studentId: 100,
                companyId: 7,
                rating: 3,
                content: "Update: công ty cực kỳ ổn áp hahaha",
                createdAt: "2026-04-20T07:18:29.309Z",
            },
        }
    }),
);
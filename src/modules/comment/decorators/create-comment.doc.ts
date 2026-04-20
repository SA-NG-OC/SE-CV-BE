import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiCreatedResponse, ApiBody } from '@nestjs/swagger';
import { CreateCommentDto } from '../dto/create-comment.dto';

export const CreateCommentDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Sinh viên đăng đánh giá mới' }),
    ApiBody({ type: CreateCommentDto }),
    ApiCreatedResponse({
        description: 'Đăng đánh giá thành công',
        example: {
            success: true,
            message: "Đăng đánh giá thành công",
            data: {
                id: 2,
                studentId: 100,
                companyId: 7,
                rating: 4,
                content: "Công ty rất tốt, môi trường chuyên nghiệp",
                createdAt: "2026-04-20T07:53:11.709Z",
            },
        }
    }),
);
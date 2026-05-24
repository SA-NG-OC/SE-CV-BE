import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiOkResponse } from '@nestjs/swagger';

export const GetMessagesDocs = () =>
    applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Lấy danh sách tin nhắn',
            description: 'Phân trang bằng cursor',
        }),
        ApiParam({
            name: 'id',
            type: Number,
            description: 'Conversation ID',
        }),
        ApiQuery({
            name: 'cursor',
            required: false,
            type: Number,
        }),
        ApiQuery({
            name: 'limit',
            required: false,
            type: Number,
        }),
        ApiOkResponse({
            description: 'Lấy thành công',
            example: {
                success: true,
                message: "Lấy tin nhắn thành công",
                data: {
                    messages: [
                        {
                            messageId: 1,
                            conversationId: 1,
                            senderId: 100,
                            content: "Xin chào, tôi quan tâm vị trí Backend Developer",
                            imageUrls: [
                                "https://res.cloudinary.com/deagejli9/image/upload/v1779589299/nest_uploads/viyztnyjl0mjzorbz5sb.png"
                            ],
                            createdAt: "2026-05-04T07:04:37.380Z",
                            isMine: true
                        },
                        {
                            messageId: 2,
                            conversationId: 1,
                            senderId: 100,
                            content: "Xin chào, tôi quan tâm vị trí Backend Developer",
                            imageUrls: [
                                "https://res.cloudinary.com/deagejli9/image/upload/v1779589299/nest_uploads/viyztnyjl0mjzorbz5sb.png"
                            ],
                            createdAt: "2026-05-04T07:05:37.864Z",
                            isMine: true
                        },
                        {
                            messageId: 3,
                            conversationId: 1,
                            senderId: 100,
                            content: "Xin chào, tôi quan tâm vị trí Backend Developer",
                            imageUrls: [
                                "https://res.cloudinary.com/deagejli9/image/upload/v1779589299/nest_uploads/viyztnyjl0mjzorbz5sb.png"
                            ],
                            createdAt: "2026-05-06T02:04:58.814Z",
                            isMine: true
                        }
                    ],
                    nextCursor: null
                }
            }
        }),
    );
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiOkResponse } from '@nestjs/swagger';

export const GetConversationsDocs = () =>
    applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Danh sách hội thoại',
            description: 'Lấy list conversation của user',
        }),
        ApiQuery({ name: 'page', required: false, type: Number }),
        ApiQuery({ name: 'limit', required: false, type: Number }),
        ApiQuery({ name: 'search', required: false, type: String }),
        ApiOkResponse({
            description: 'Thành công',
            example: {
                success: true,
                message: "Lấy danh sách hội thoại thành công",
                data: {
                    data: [
                        {
                            conversationId: 1,
                            lastMessageAt: "2026-05-06T02:04:58.814Z",
                            createdAt: "2026-05-04T07:04:32.103Z",
                            unreadCount: 0,
                            lastMessage: {
                                content: "Xin chào, tôi quan tâm vị trí Backend Developer",
                                hasImages: null,
                                senderId: 100,
                                createdAt: "2026-05-06 02:04:58.814"
                            },
                            partner: {
                                id: 100,
                                name: "Tech Solutions Vietnam",
                                avatarUrl: null
                            }
                        }
                    ],
                    meta: {
                        currentPage: 1,
                        itemsPerPage: 20,
                        totalItems: 1,
                        totalPages: 1
                    }
                }
            }
        }),
    );
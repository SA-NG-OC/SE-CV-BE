import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { SendMessageDto } from '../dto/chat.dto';

export const SendMessageDocs = () =>
    applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Gửi tin nhắn',
            description: 'Gửi message vào conversation',
        }),
        ApiBody({
            type: SendMessageDto,
            required: true,
        }),
        ApiOkResponse({
            description: 'Gửi thành công',
            example: {
                success: true,
                message: "Gửi tin nhắn thành công",
                data: {
                    message: {
                        messageId: 3,
                        conversationId: 1,
                        senderId: 100,
                        content: "Xin chào, tôi quan tâm vị trí Backend Developer",
                        createdAt: "2026-05-06T02:04:58.814Z",
                        isMine: true
                    },
                    recipientUserIds: [2000]
                }
            }
        }),
    );
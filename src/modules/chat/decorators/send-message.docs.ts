import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
} from '@nestjs/swagger';

export const SendMessageDocs = () =>
  applyDecorators(
    ApiBearerAuth(),

    ApiOperation({
      summary: 'Gửi tin nhắn',
      description: 'Gửi message vào conversation',
    }),

    ApiConsumes('multipart/form-data'),

    ApiBody({
      schema: {
        type: 'object',
        required: ['conversationId'],
        properties: {
          conversationId: {
            type: 'number',
            example: 10,
            description: 'ID cuộc hội thoại',
          },

          content: {
            type: 'string',
            example: 'Xin chào, tôi quan tâm vị trí Backend Developer',
            nullable: true,
          },

          images: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
            description: 'Danh sách ảnh upload',
          },
        },
      },
    }),

    ApiOkResponse({
      description: 'Gửi thành công',
      schema: {
        example: {
          success: true,
          message: 'Gửi tin nhắn thành công',
          data: {
            message: {
              messageId: 3,
              conversationId: 1,
              senderId: 100,
              content: 'Xin chào, tôi quan tâm vị trí Backend Developer',
              imageUrls: [
                'https://res.cloudinary.com/demo/image/upload/sample.jpg',
              ],
              createdAt: '2026-05-06T02:04:58.814Z',
              isMine: true,
            },
          },
        },
      },
    }),
  );

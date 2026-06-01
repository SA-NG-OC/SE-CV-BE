import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
} from '@nestjs/swagger';
import { GetOrCreateConversationDto } from '../dto/chat.dto';

export const GetOrCreateConversationDocs = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Tạo hoặc lấy conversation',
      description: 'Nếu tồn tại thì trả về, nếu chưa thì tạo mới',
    }),
    ApiBody({
      type: GetOrCreateConversationDto,
      required: true,
    }),
    ApiOkResponse({
      description: 'Thành công',
      example: {
        success: true,
        message: 'Thành công',
        data: {
          conversationId: 1,
          isNew: false,
        },
      },
    }),
  );

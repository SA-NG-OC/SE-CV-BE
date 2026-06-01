import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
} from '@nestjs/swagger';
import { SetHiddenDto } from '../dto/chat.dto';

export const SetHiddenDocs = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Ẩn/hiện conversation',
    }),
    ApiBody({
      type: SetHiddenDto,
      required: true,
    }),
    ApiOkResponse({
      description: 'Thành công',
      example: {
        success: true,
        message: 'Cập nhật trạng thái ẩn thành công',
        data: {
          userId: 100,
          conversationId: 1,
          isHidden: true,
          isBlocked: false,
          lastReadMessageId: 1,
        },
      },
    }),
  );

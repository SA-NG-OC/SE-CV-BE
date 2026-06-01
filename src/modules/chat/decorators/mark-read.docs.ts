import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
} from '@nestjs/swagger';
import { MarkReadDto } from '../dto/chat.dto';

export const MarkReadDocs = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Đánh dấu đã đọc',
    }),
    ApiBody({
      type: MarkReadDto,
      required: true,
    }),
    ApiOkResponse({
      description: 'Thành công',
      example: {
        success: true,
        message: 'Đã đánh dấu đã đọc',
        data: {},
      },
    }),
  );

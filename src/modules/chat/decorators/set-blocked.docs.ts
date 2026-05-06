import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { SetBlockedDto } from '../dto/chat.dto';

export const SetBlockedDocs = () =>
    applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Chặn/bỏ chặn conversation',
        }),
        ApiBody({
            type: SetBlockedDto,
            required: true,
        }),
        ApiOkResponse({
            description: 'Thành công',
            example: {
                success: true,
                message: "Cập nhật trạng thái chặn thành công",
                data: {
                    userId: 100,
                    conversationId: 1,
                    isHidden: true,
                    isBlocked: false,
                    lastReadMessageId: 1
                }
            }
        }),
    );
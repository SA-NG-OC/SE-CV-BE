import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

export const UnfollowCompanyDocs = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Unfollow công ty',
      description:
        'Sinh viên hủy theo dõi một công ty. Nếu chưa follow trước đó thì vẫn trả về thành công (idempotent).',
    }),
    ApiParam({
      name: 'companyId',
      type: Number,
      example: 5,
      description: 'ID của công ty cần unfollow',
    }),
    ApiOkResponse({
      description: 'Unfollow thành công',
      example: {
        success: true,
        message: 'Unfollow công ty thành công',
        data: {},
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Chưa đăng nhập hoặc token không hợp lệ',
    }),
    ApiForbiddenResponse({
      description: 'Không có quyền (không phải STUDENT)',
    }),
  );

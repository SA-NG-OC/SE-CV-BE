import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

export const FollowCompanyDocs = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Follow công ty',
      description:
        'Sinh viên follow một công ty. Không thể follow lại nếu đã follow trước đó.',
    }),
    ApiParam({
      name: 'companyId',
      type: Number,
      example: 5,
      description: 'ID của công ty cần follow',
    }),
    ApiOkResponse({
      description: 'Follow thành công',
      example: {
        success: true,
        message: 'Follow công ty thành công',
        data: {},
      },
    }),
    ApiBadRequestResponse({
      description: 'Đã follow trước đó hoặc công ty không hợp lệ',
      example: {
        success: false,
        message: 'Bạn đã follow công ty này rồi',
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Chưa đăng nhập hoặc token không hợp lệ',
    }),
    ApiForbiddenResponse({
      description: 'Không có quyền (không phải STUDENT)',
    }),
  );

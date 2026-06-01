import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

const ToggleStudentActiveDocs = () =>
  applyDecorators(
    HttpCode(HttpStatus.NO_CONTENT),
    ApiBearerAuth('access-token'),

    ApiOperation({
      summary: 'Bật/Tắt trạng thái hoạt động của sinh viên',
      description:
        'Cho phép admin bật hoặc vô hiệu hóa tài khoản sinh viên thông qua userId.',
    }),

    ApiParam({
      name: 'userId',
      type: Number,
      example: 1,
      description: 'studentId cần thay đổi trạng thái',
    }),

    ApiBody({
      schema: {
        example: {
          isActive: false,
        },
      },
      description: 'Trạng thái hoạt động mới của tài khoản',
    }),

    ApiNoContentResponse({
      description: 'Cập nhật trạng thái thành công (không trả về dữ liệu)',
    }),

    ApiBadRequestResponse({
      description: 'Dữ liệu không hợp lệ',
      schema: {
        example: {
          statusCode: 400,
          message: 'Dữ liệu không hợp lệ',
          error: 'Bad Request',
        },
      },
    }),

    ApiNotFoundResponse({
      description: 'Không tìm thấy sinh viên',
      schema: {
        example: {
          statusCode: 404,
          message: 'Sinh viên không tồn tại',
          error: 'Not Found',
        },
      },
    }),

    ApiForbiddenResponse({
      description: 'Không có quyền thực hiện hành động này',
      schema: {
        example: {
          statusCode: 403,
          message: 'Forbidden resource',
          error: 'Forbidden',
        },
      },
    }),
  );

export default ToggleStudentActiveDocs;

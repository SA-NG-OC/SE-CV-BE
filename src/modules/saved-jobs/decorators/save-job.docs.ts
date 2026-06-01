import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger/dist';

export const SaveJobDocs = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Lưu job',
      description: 'Sinh viên lưu một job vào danh sách yêu thích',
    }),
    ApiParam({
      name: 'jobId',
      type: Number,
      example: 10,
    }),
    ApiOkResponse({
      description: 'Lưu thành công',
      example: {
        success: true,
        message: 'Lưu job thành công',
        data: {
          jobId: 10,
          isSaved: true,
        },
      },
    }),
  );

export const UnsaveJobDocs = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Bỏ lưu job',
      description: 'Sinh viên bỏ lưu job',
    }),
    ApiParam({
      name: 'jobId',
      type: Number,
      example: 10,
    }),
    ApiOkResponse({
      description: 'Bỏ lưu thành công',
      example: {
        success: true,
        message: 'Bỏ lưu job thành công',
        data: {
          jobId: 10,
          isSaved: false,
        },
      },
    }),
  );

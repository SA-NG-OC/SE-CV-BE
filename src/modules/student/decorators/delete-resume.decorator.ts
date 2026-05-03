import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiNoContentResponse,
    ApiBadRequestResponse,
    ApiNotFoundResponse,
} from '@nestjs/swagger';

const DeleteResumeDocs = () =>
    applyDecorators(
        HttpCode(HttpStatus.NO_CONTENT),
        ApiBearerAuth('access-token'),

        ApiOperation({
            summary: 'Xóa CV',
            description:
                'Xóa CV của sinh viên theo resumeId. Không cho phép xóa CV mặc định.',
        }),

        ApiParam({
            name: 'resumeId',
            type: Number,
            example: 1,
            description: 'ID của CV cần xóa',
        }),

        ApiNoContentResponse({
            description: 'Xóa CV thành công (không trả về dữ liệu)',
        }),

        ApiBadRequestResponse({
            description: 'Không thể xóa CV mặc định',
            schema: {
                example: {
                    statusCode: 400,
                    message: 'Không thể xóa CV mặc định',
                    error: 'Bad Request',
                },
            },
        }),

        ApiNotFoundResponse({
            description: 'CV không tồn tại',
            schema: {
                example: {
                    statusCode: 404,
                    message: 'CV không tồn tại',
                    error: 'Not Found',
                },
            },
        }),
    );

export default DeleteResumeDocs;
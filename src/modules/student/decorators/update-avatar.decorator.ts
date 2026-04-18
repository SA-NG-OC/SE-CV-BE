// decorators/update-avatar.decorator.ts
import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiConsumes,
    ApiBody,
    ApiOkResponse,
} from '@nestjs/swagger';

const UpdateAvatarDocs = () =>
    applyDecorators(
        HttpCode(HttpStatus.OK),
        ApiBearerAuth('access-token'),
        ApiConsumes('multipart/form-data'),
        ApiOperation({
            summary: 'Cập nhật ảnh đại diện',
            description: 'Upload file ảnh (multipart/form-data). Yêu cầu quyền STUDENT.',
        }),
        ApiBody({
            schema: {
                type: 'object',
                properties: {
                    avatar: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        }),
        ApiOkResponse({
            description: 'Cập nhật ảnh đại diện thành công',
            schema: {
                example: {
                    success: true,
                    message: "Cập nhật ảnh đại diện thành công",
                    data: {
                        avatarUrl: "https://res.cloudinary.com/deagejli9/image/upload/v1776239999/nest_uploads/qwio1okqffu5en7ddxjo.png"
                    }
                }
            },
        }),
    );

export default UpdateAvatarDocs;
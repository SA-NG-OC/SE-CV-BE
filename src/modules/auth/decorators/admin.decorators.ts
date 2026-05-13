import {
    applyDecorators,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

export function GetAllAdminsDocs() {
    return applyDecorators(
        ApiTags('Auth'),
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Lấy danh sách tất cả admin',
        }),
        ApiResponse({
            status: 200,
            description: 'Lấy danh sách admin thành công',
            schema: {
                example: {
                    success: true,
                    message: 'Lấy danh sách admin thành công',
                    data: [
                        {
                            id: 1,
                            email: 'admin1@gmail.com',
                            roleName: 'admin',
                            createdAt: '2026-05-08T10:00:00.000Z',
                            lastLogin: '2026-05-08T12:30:00.000Z',
                        },
                        {
                            id: 2,
                            email: 'admin2@gmail.com',
                            roleName: 'admin',
                            createdAt: '2026-05-07T09:15:00.000Z',
                            lastLogin: null,
                        },
                    ],
                },
            },
        }),
        ApiResponse({
            status: 401,
            description: 'Unauthorized',
        }),
        ApiResponse({
            status: 403,
            description: 'Forbidden',
        }),
    );
}

export function CreateAdminDocs() {
    return applyDecorators(
        ApiTags('Auth'),
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Tạo tài khoản admin mới',
        }),
        ApiBody({
            schema: {
                type: 'object',
                properties: {
                    email: {
                        type: 'string',
                        example: 'admin@gmail.com',
                    },
                    password: {
                        type: 'string',
                        example: '123456',
                    },
                },
                required: ['email', 'password'],
            },
        }),
        ApiResponse({
            status: 201,
            description: 'Tạo admin thành công',
        }),
        ApiResponse({
            status: 400,
            description: 'Email đã tồn tại',
        }),
        ApiResponse({
            status: 401,
            description: 'Unauthorized',
        }),
        ApiResponse({
            status: 403,
            description: 'Forbidden',
        }),
    );
}

export function DeleteAdminDocs() {
    return applyDecorators(
        ApiTags('Auth'),
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Xóa tài khoản admin',
        }),
        ApiParam({
            name: 'userId',
            type: Number,
            example: 1,
            description: 'ID admin cần xóa',
        }),
        ApiResponse({
            status: 200,
            description: 'Xóa admin thành công',
        }),
        ApiResponse({
            status: 400,
            description:
                'Không thể xóa chính tài khoản của mình hoặc user không phải admin',
        }),
        ApiResponse({
            status: 404,
            description: 'Admin không tồn tại',
        }),
        ApiResponse({
            status: 401,
            description: 'Unauthorized',
        }),
        ApiResponse({
            status: 403,
            description: 'Forbidden',
        }),
    );
}
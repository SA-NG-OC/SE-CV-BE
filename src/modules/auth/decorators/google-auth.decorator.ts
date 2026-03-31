import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

const GoogleAuthDocs = () => applyDecorators(
    HttpCode(HttpStatus.FOUND),
    ApiOperation({
        summary: 'Đăng nhập bằng Google (OAuth 2.0)',
        description: 'Redirect người dùng đến trang đăng nhập Google. Không cần body hay token.',
    }),
    ApiResponse({
        status: HttpStatus.FOUND,
        description: 'Redirect sang Google consent screen.',
    }),
);

export default GoogleAuthDocs;
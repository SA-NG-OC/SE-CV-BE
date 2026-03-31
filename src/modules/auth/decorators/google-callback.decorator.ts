import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

const GoogleCallbackDocs = () => applyDecorators(
    HttpCode(HttpStatus.FOUND),
    ApiOperation({
        summary: 'Google OAuth callback',
        description: 'Google redirect về đây sau khi người dùng đăng nhập. Server xử lý và redirect về frontend kèm JWT token.',
    }),
    ApiQuery({
        name: 'code',
        required: false,
        description: 'Authorization code do Google gửi về (tự động, không cần truyền tay).',
    }),
    ApiResponse({
        status: HttpStatus.FOUND,
        description: 'Redirect về frontend với JWT token trong query param.',
        schema: { example: { url: 'http://localhost:5173/oauth/callback?token=eyJhbGc...' } },
    }),
    ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Xác thực Google thất bại.',
        schema: { example: { success: false, message: 'Unauthorized' } },
    }),
);

export default GoogleCallbackDocs;
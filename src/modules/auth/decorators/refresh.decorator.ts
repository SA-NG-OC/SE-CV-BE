// decorators/refresh.decorator.ts
import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

const RefreshDocs = () => applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiCookieAuth('refresh_token'),
    ApiOperation({
        summary: 'Làm mới access token',
        description: 'Dùng `refresh_token` từ HttpOnly cookie để cấp `access_token` mới. Đồng thời rotate `refresh_token`.',
    }),
    ApiOkResponse({
        description: 'Cấp access token mới thành công.',
        schema: {
            example: {
                success: true,
                data: { access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            },
        },
    }),
);

export default RefreshDocs;
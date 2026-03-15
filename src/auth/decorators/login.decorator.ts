import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';

const LoginDocs = () => applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({
        summary: 'Đăng nhập',
        description: 'Trả về `access_token` trong body và set `refresh_token` vào HttpOnly cookie.',
    }),
    ApiBody({ type: LoginDto }),
    ApiOkResponse({
        description: 'Đăng nhập thành công.',
        schema: {
            example: {
                success: true,
                message: 'Đăng nhập thành công',
                data: { access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            },
        },
    }),
);
export default LoginDocs;
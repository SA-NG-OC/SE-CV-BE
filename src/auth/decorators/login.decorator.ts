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
                data: {
                    access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    user: {
                        user_id: 11,
                        email: "sang22102005@gmail.com",
                        role_id: 2,
                        is_active: true,
                        is_verified: true,
                        verification_token: null,
                        reset_token: null,
                        reset_token_expires: null,
                        last_login: "2026-03-19T06:23:57.408Z",
                        created_at: "2026-03-12T15:34:37.438Z",
                        updated_at: "2026-03-14T02:20:51.508Z",
                        oauth_provider: "google",
                        oauth_provider_id: "100844144305870518667"
                    }
                },
            },
        },
    }),
);
export default LoginDocs;
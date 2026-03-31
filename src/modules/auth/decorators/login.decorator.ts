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
                        role: "ADMIN",
                        full_name: "Sơn Sơn Sơn",
                        avatar_url: "https://www.youtube.com/watch?v=6Lrb6Yf21m8&list=RD6Lrb6Yf21m8&start_radio=1",
                        is_active: true,
                        is_verified: true
                    }
                },
            },
        },
    }),
);
export default LoginDocs;
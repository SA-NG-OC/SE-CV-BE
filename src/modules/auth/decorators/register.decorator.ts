// decorators/register.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiCreatedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { RegisterDto } from '../dto/register.dto';

const RegisterDocs = () => applyDecorators(
    ApiOperation({
        summary: 'Đăng ký tài khoản',
        description: 'Tạo tài khoản mới. Email xác nhận sẽ được gửi sau khi đăng ký.',
    }),
    ApiBody({ type: RegisterDto }),
    ApiCreatedResponse({
        description: 'Đăng ký thành công. Email xác nhận đã được gửi.',
        schema: {
            example: { success: true, message: 'Đăng kí tài khoản thành công' },
        },
    }),
);

export default RegisterDocs;
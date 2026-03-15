// decorators/reset-password.decorator.ts
import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiOkResponse, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { ResetPasswordDto } from '../dto/reset-password.dto';

const ResetPasswordDocs = () => applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({
        summary: 'Quên mật khẩu — Bước 3: Đặt mật khẩu mới',
        description: 'Dùng `resetToken` từ bước 2. Token chỉ dùng được **một lần** và hết hạn sau **15 phút**.',
    }),
    ApiBody({ type: ResetPasswordDto }),
    ApiOkResponse({
        description: 'Đặt lại mật khẩu thành công.',
        schema: { example: { message: 'Đổi mật khẩu thành công' } },
    }),
);

export default ResetPasswordDocs;
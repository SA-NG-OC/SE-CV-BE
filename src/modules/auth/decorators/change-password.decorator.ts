// decorators/change-password.decorator.ts
import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ChangePasswordDto } from '../dto/change-password.dto';

const ChangePasswordDocs = () => applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiBearerAuth('access-token'),
    ApiOperation({
        summary: 'Đổi mật khẩu (khi đã đăng nhập)',
        description: 'Yêu cầu `Bearer Token`. Người dùng phải cung cấp mật khẩu cũ để xác nhận.',
    }),
    ApiBody({ type: ChangePasswordDto }),
    ApiOkResponse({
        description: 'Đổi mật khẩu thành công.',
        schema: { example: { success: true, message: 'Đổi mật khẩu thành công' } },
    }),
);

export default ChangePasswordDocs;
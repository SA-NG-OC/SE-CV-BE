import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';

const ForgotPasswordDocs = () => applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({
        summary: 'Yêu cầu đặt lại mật khẩu (quên mật khẩu)',
        description: 'Người dùng cung cấp email để nhận hướng dẫn đặt lại mật khẩu.',
    }),
    ApiBody({ type: ForgotPasswordDto }),
    ApiOkResponse({
        description: 'Yêu cầu đặt lại mật khẩu thành công. Hướng dẫn sẽ được gửi đến email nếu tồn tại.',
        schema: { example: { success: true, message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.' } },
    }),
);

export default ForgotPasswordDocs;
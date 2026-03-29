// decorators/verify-otp.decorator.ts
import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { VerifyOtpDto } from '../dto/verify-otp.dto';

const VerifyOtpDocs = () => applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({
        summary: 'Quên mật khẩu — Bước 2: Xác nhận OTP',
        description: 'Xác nhận mã OTP. Trả về `resetToken` dùng cho bước đặt lại mật khẩu. Token có hiệu lực **15 phút**.',
    }),
    ApiBody({ type: VerifyOtpDto }),
    ApiOkResponse({
        description: 'OTP hợp lệ. Trả về `resetToken`.',
        schema: {
            example: {
                success: true,
                message: "OTP hợp lệ",
                data: {
                    resetToken: "3d860e33-ab36-4bbf-bd39-910b8550dbcc"
                }
            }
        },
    }),
);

export default VerifyOtpDocs;
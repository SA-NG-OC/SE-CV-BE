// decorators/verify-email.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';

const VerifyEmailDocs = () => applyDecorators(
    ApiOperation({
        summary: 'Xác nhận email',
        description: 'Được gọi từ link trong email xác nhận. Token có hiệu lực **15 phút**.',
    }),
    ApiQuery({
        name: 'token',
        required: true,
        description: 'JWT token xác nhận được đính kèm trong email',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    }),
    ApiOkResponse({
        description: 'Xác nhận email thành công.',
        schema: { example: { success: true, message: 'Xác thực email thành công' } },
    }),
);

export default VerifyEmailDocs;
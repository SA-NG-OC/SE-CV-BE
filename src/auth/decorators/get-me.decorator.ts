import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

const GetMeDocs = () =>
    applyDecorators(
        HttpCode(HttpStatus.OK),

        ApiBearerAuth(),

        ApiOperation({
            summary: 'Lấy thông tin người dùng hiện tại',
            description: 'Yêu cầu access token để lấy thông tin của user đang đăng nhập.',
        }),

        ApiOkResponse({
            description: 'Lấy thông tin người dùng thành công',
            example: {
                success: true,
                message: "Lấy thông tin người dùng thành công",
                data: {
                    userId: 2,
                    email: "company@test.com",
                    isActive: true,
                    isVerified: true,
                    role: 2
                },
            }
        }),
    );

export default GetMeDocs;
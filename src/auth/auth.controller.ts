import { Body, Controller, Post, UsePipes, Res, Request, UnauthorizedException, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { loginSchema } from './dto/auth/login.dto';
import { registerScheme } from './dto/auth/register.dto';
import type { LoginDto } from './dto/auth/login.dto';
import type { RegisterDto } from './dto/auth/register.dto';
import type { Response } from 'express';
import { ApiTags, ApiBody, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { ChangePasswordDto, changePasswordSchema } from './dto/auth/changePassword.dto';
import { forgotPasswordSchema, ForgotPasswordDto } from './dto/auth/forgot-password.dto';
import { verifyOtpSchema, VerifyOtpDto } from './dto/auth/verify-otp.dto';
import { resetPasswordSchema, ResetPasswordDto } from './dto/auth/reset-password.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @UsePipes(new ZodValidationPipe(loginSchema))
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Đăng nhập',
        description: 'Xác thực người dùng. Trả về `access_token` trong body và tự động set `refresh_token` vào HttpOnly cookie.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
                email: { type: 'string', format: 'email', example: 'user@example.com' },
                password: { type: 'string', minLength: 6, example: '123456' },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Đăng nhập thành công. `refresh_token` được set vào cookie `HttpOnly`.',
        schema: {
            example: {
                success: true,
                message: 'Đăng nhập thành công',
                data: { access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Sai email/mật khẩu, tài khoản bị khóa hoặc chưa xác thực email.',
        schema: {
            example: { statusCode: 401, message: 'Email hoặc mật khẩu không chính xác' },
        },
    })
    async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(body);
        res.cookie('refresh_token', result.data.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return {
            success: true,
            message: 'Đăng nhập thành công',
            data: { access_token: result.data.access_token },
        };
    }

    @Post('register')
    @UsePipes(new ZodValidationPipe(registerScheme))
    @ApiOperation({
        summary: 'Đăng ký tài khoản',
        description: 'Tạo tài khoản mới và gửi email xác nhận. Tài khoản cần được xác thực qua email trước khi đăng nhập.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
                email: { type: 'string', format: 'email', example: 'newuser@example.com' },
                password: { type: 'string', minLength: 6, example: 'securePassword123' },
                confirmPassword: { type: 'string', minLength: 6, example: 'securePassword123' },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Đăng ký thành công. Email xác nhận đã được gửi.',
        schema: {
            example: {
                success: true,
                message: 'Đăng kí tài khoản thành công',
            },
        },
    })
    @ApiResponse({
        status: 409,
        description: 'Email đã được sử dụng bởi tài khoản khác.',
        schema: {
            example: { statusCode: 409, message: 'Email đã được sử dụng' },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Dữ liệu đầu vào không hợp lệ (sai định dạng email, thiếu trường bắt buộc...).',
        schema: {
            example: { statusCode: 400, message: ['email must be a valid email'] },
        },
    })
    async register(@Body() registerDto: RegisterDto) {
        await this.authService.register(registerDto);
        return {
            success: true,
            message: 'Đăng kí tài khoản thành công',
        };
    }

    @Get('verify-email')
    @ApiOperation({
        summary: 'Xác nhận email',
        description: 'Được gọi từ link trong email xác nhận. Token có hiệu lực **15 phút** kể từ khi đăng ký.',
    })
    @ApiQuery({
        name: 'token',
        required: true,
        description: 'JWT token xác nhận được đính kèm trong email',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @ApiResponse({
        status: 200,
        description: 'Xác nhận email thành công hoặc tài khoản đã được xác nhận trước đó.',
        schema: {
            example: {
                success: true,
                message: 'Xác thực email thành công',
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Token không hợp lệ, đã hết hạn, hoặc không tìm thấy tài khoản tương ứng.',
        schema: {
            example: { statusCode: 400, message: 'Link xác nhận không hợp lệ hoặc đã hết hạn' },
        },
    })
    async verifyEmail(@Query('token') token: string) {
        if (!token) throw new BadRequestException('Thiếu token xác nhận');
        const result = await this.authService.verifyEmail(token);
        return { success: true, message: result.message };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('refresh_token')
    @ApiOperation({
        summary: 'Làm mới access token',
        description: 'Dùng `refresh_token` từ HttpOnly cookie để cấp `access_token` mới. Đồng thời rotate `refresh_token` (token cũ bị thu hồi).',
    })
    @ApiResponse({
        status: 200,
        description: 'Cấp access token mới thành công. refresh_token mới được set lại vào cookie.',
        schema: {
            example: {
                success: true,
                data: { access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Không tìm thấy refresh token trong cookie, token không hợp lệ hoặc đã bị thu hồi.',
        schema: {
            example: { statusCode: 401, message: 'Refresh token không hợp lệ hoặc đã hết hạn' },
        },
    })
    async Refresh(@Request() req, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies['refresh_token'];
        if (!refreshToken) throw new UnauthorizedException('Không tìm thấy Refresh Token');

        const tokens = await this.authService.refreshToken(refreshToken);
        res.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return { success: true, data: { access_token: tokens.accessToken } };
    }

    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodValidationPipe(changePasswordSchema))
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Đổi mật khẩu (khi đã đăng nhập)',
        description: 'Yêu cầu `Bearer Token` trong header. Người dùng phải cung cấp mật khẩu cũ để xác nhận trước khi đổi.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['userId', 'oldPassword', 'newPassword', 'confirmPassword'],
            properties: {
                userId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
                oldPassword: { type: 'string', example: 'oldPassword123' },
                newPassword: { type: 'string', minLength: 6, example: 'newSecurePassword456' },
                confirmPassword: { type: 'string', example: 'newSecurePassword456' },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Đổi mật khẩu thành công.',
        schema: {
            example: { success: true, message: 'Đổi mật khẩu thành công' },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Mật khẩu cũ không đúng hoặc mật khẩu mới và xác nhận không khớp.',
        schema: {
            example: { statusCode: 400, message: 'Mật khẩu cũ không chính xác' },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Chưa xác thực — thiếu hoặc access token không hợp lệ.',
        schema: {
            example: { statusCode: 401, message: 'Unauthorized' },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Không tìm thấy người dùng với userId đã cung cấp.',
        schema: {
            example: { statusCode: 404, message: 'Không tìm thấy người dùng' },
        },
    })
    async changePassword(@Body() data: ChangePasswordDto) {
        const result = await this.authService.changePassword(data);
        return { success: true, message: result.message };
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodValidationPipe(forgotPasswordSchema))
    @ApiOperation({
        summary: 'Quên mật khẩu — Bước 1: Gửi OTP',
        description: 'Nhập email để nhận mã OTP 6 số. OTP có hiệu lực **5 phút**. Để bảo mật, response luôn trả về thành công dù email có tồn tại hay không.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['email'],
            properties: {
                email: { type: 'string', format: 'email', example: 'user@example.com' },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Yêu cầu đã được xử lý (OTP được gửi nếu email tồn tại).',
        schema: {
            example: { message: 'Nếu email tồn tại, OTP đã được gửi đến hộp thư của bạn' },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Email không đúng định dạng.',
        schema: {
            example: { statusCode: 400, message: ['email must be a valid email'] },
        },
    })
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto.email);
    }

    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodValidationPipe(verifyOtpSchema))
    @ApiOperation({
        summary: 'Quên mật khẩu — Bước 2: Xác nhận OTP',
        description: 'Xác nhận mã OTP nhận được qua email. Trả về `resetToken` dùng cho bước đặt lại mật khẩu. Token có hiệu lực **15 phút**.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['email', 'otp'],
            properties: {
                email: { type: 'string', format: 'email', example: 'user@example.com' },
                otp: { type: 'string', minLength: 6, maxLength: 6, pattern: '^[0-9]{6}$', example: '482931' },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'OTP hợp lệ. Trả về `resetToken` để dùng ở bước tiếp theo.',
        schema: {
            example: { resetToken: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'OTP không hợp lệ, sai hoặc đã hết hạn (quá 5 phút).',
        schema: {
            example: { statusCode: 400, message: 'OTP không hợp lệ hoặc đã hết hạn' },
        },
    })
    async verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.authService.verifyOtp(dto.email, dto.otp);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodValidationPipe(resetPasswordSchema))
    @ApiOperation({
        summary: 'Quên mật khẩu — Bước 3: Đặt mật khẩu mới',
        description: 'Dùng `resetToken` nhận được từ bước 2 để đặt mật khẩu mới. Token chỉ dùng được **một lần** và hết hạn sau **15 phút**.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['resetToken', 'newPassword'],
            properties: {
                resetToken: { type: 'string', format: 'uuid', example: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' },
                newPassword: { type: 'string', minLength: 6, example: 'myNewPassword789' },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Đặt lại mật khẩu thành công.',
        schema: {
            example: { message: 'Đổi mật khẩu thành công' },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'resetToken không hợp lệ hoặc đã hết hạn (quá 15 phút hoặc đã dùng rồi).',
        schema: {
            example: { statusCode: 400, message: 'Token không hợp lệ hoặc đã hết hạn' },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Không tìm thấy người dùng tương ứng với token.',
        schema: {
            example: { statusCode: 404, message: 'Người dùng không tồn tại' },
        },
    })
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto.resetToken, dto.newPassword);
    }
}
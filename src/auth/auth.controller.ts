import { Body, Controller, Post, UsePipes, Res, Request, UnauthorizedException, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { loginSchema } from './dto/login.dto';
import { registerScheme } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';
import { ChangePasswordDto, changePasswordSchema } from './dto/changePassword.dto';
import { forgotPasswordSchema, ForgotPasswordDto } from './dto/forgot-password.dto';
import { verifyOtpSchema, VerifyOtpDto } from './dto/verify-otp.dto';
import { resetPasswordSchema, ResetPasswordDto } from './dto/reset-password.dto';
import ResponseSuccess from 'src/common/types/responseSuccess';
import ChangePasswordDocs from './decorators/change-password.decorator';
import LoginDocs from './decorators/login.decorator';
import VerifyOtpDocs from './decorators/verify-otp.decorator';
import ResetPasswordDocs from './decorators/reset-password.decorator';
import RegisterDocs from './decorators/register.decorator';
import VerifyEmailDocs from './decorators/verify-email.decorator';
import RefreshDocs from './decorators/refresh.decorator';
import ForgotPasswordDocs from './decorators/forgot-password.decorator';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @LoginDocs()
    @UsePipes(new ZodValidationPipe(loginSchema))
    async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(body);
        res.cookie('refresh_token', result.data.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return new ResponseSuccess('Đăng nhập thành công', { access_token: result.data.access_token });
    }

    @Post('register')
    @UsePipes(new ZodValidationPipe(registerScheme))
    @RegisterDocs()
    async register(@Body() registerDto: RegisterDto) {
        await this.authService.register(registerDto);
        return new ResponseSuccess('Đăng kí tài khoản thành công', {});
    }

    @Get('verify-email')
    @VerifyEmailDocs()
    async verifyEmail(@Query('token') token: string) {
        if (!token) throw new BadRequestException('Thiếu token xác nhận');
        const result = await this.authService.verifyEmail(token);
        return new ResponseSuccess(result.message, {});
    }

    @Post('refresh')
    @RefreshDocs()
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
        return new ResponseSuccess('Làm mới token thành công', { access_token: tokens.accessToken });
    }

    @Post('change-password')
    @UsePipes(new ZodValidationPipe(changePasswordSchema))
    @ChangePasswordDocs()
    async changePassword(@Body() data: ChangePasswordDto) {
        const result = await this.authService.changePassword(data);
        return new ResponseSuccess(result.message, {});
    }

    @Post('forgot-password')
    @UsePipes(new ZodValidationPipe(forgotPasswordSchema))
    @ForgotPasswordDocs()
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        await this.authService.forgotPassword(dto.email);
        return new ResponseSuccess('Nếu email tồn tại, OTP đã được gửi đến hộp thư của bạn', {});
    }

    @Post('verify-otp')
    @VerifyOtpDocs()
    @UsePipes(new ZodValidationPipe(verifyOtpSchema))
    async verifyOtp(@Body() dto: VerifyOtpDto) {
        const result = await this.authService.verifyOtp(dto.email, dto.otp);
        return new ResponseSuccess('OTP hợp lệ', { resetToken: result.resetToken });
    }

    @Post('reset-password')
    @ResetPasswordDocs()
    @UsePipes(new ZodValidationPipe(resetPasswordSchema))
    async resetPassword(@Body() dto: ResetPasswordDto) {
        await this.authService.resetPassword(dto.resetToken, dto.newPassword);
        return new ResponseSuccess('Đặt lại mật khẩu thành công', {});
    }
}
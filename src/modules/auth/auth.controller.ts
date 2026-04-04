import { Body, Controller, Post, UsePipes, Res, Request, UnauthorizedException, Get, Query, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { loginSchema } from './dto/login.dto';
import { registerScheme } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';
import { ChangePasswordDto, changePasswordSchema } from './dto/change-password.dto';
import { forgotPasswordSchema, ForgotPasswordDto } from './dto/forgot-password.dto';
import { verifyOtpSchema, VerifyOtpDto } from './dto/verify-otp.dto';
import { resetPasswordSchema, ResetPasswordDto } from './dto/reset-password.dto';
import ResponseSuccess from 'src/common/types/response-success';
import ChangePasswordDocs from './decorators/change-password.decorator';
import LoginDocs from './decorators/login.decorator';
import VerifyOtpDocs from './decorators/verify-otp.decorator';
import ResetPasswordDocs from './decorators/reset-password.decorator';
import RegisterDocs from './decorators/register.decorator';
import VerifyEmailDocs from './decorators/verify-email.decorator';
import RefreshDocs from './decorators/refresh.decorator';
import ForgotPasswordDocs from './decorators/forgot-password.decorator';
import { GoogleOAuthGuard } from './guards/google.guard';
import { UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import GoogleAuthDocs from './decorators/google-auth.decorator';
import GoogleCallbackDocs from './decorators/google-callback.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import GetMeDocs from './decorators/get-me.decorator';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
    constructor(private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) { }

    @Post('login')
    @LoginDocs()
    //@UsePipes(new ZodValidationPipe(loginSchema))
    async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(body);
        res.cookie('refresh_token', result.data.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        const data = {
            access_token: result.data.access_token,
            user: result.data.user,
        }
        return new ResponseSuccess('Đăng nhập thành công', data);
    }

    @Post('register')
    //@UsePipes(new ZodValidationPipe(registerScheme))
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
    //@UsePipes(new ZodValidationPipe(changePasswordSchema))
    @ChangePasswordDocs()
    @UseGuards(JwtAuthGuard)
    async changePassword(@Body() data: ChangePasswordDto) {
        const result = await this.authService.changePassword(data);
        return new ResponseSuccess(result.message, {});
    }

    @Post('forgot-password')
    //@UsePipes(new ZodValidationPipe(forgotPasswordSchema))
    @ForgotPasswordDocs()
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        await this.authService.forgotPassword(dto.email);
        return new ResponseSuccess('Nếu email tồn tại, OTP đã được gửi đến hộp thư của bạn', {});
    }

    @Post('verify-otp')
    @VerifyOtpDocs()
    //@UsePipes(new ZodValidationPipe(verifyOtpSchema))
    async verifyOtp(@Body() dto: VerifyOtpDto) {
        const result = await this.authService.verifyOtp(dto.email, dto.otp);
        return new ResponseSuccess('OTP hợp lệ', { resetToken: result.resetToken });
    }

    @Post('reset-password')
    @ResetPasswordDocs()
    //@UsePipes(new ZodValidationPipe(resetPasswordSchema))
    async resetPassword(@Body() dto: ResetPasswordDto) {
        await this.authService.resetPassword(dto.resetToken, dto.newPassword);
        return new ResponseSuccess('Đặt lại mật khẩu thành công', {});
    }

    @Get('me')
    @GetMeDocs()
    @UseGuards(JwtAuthGuard)
    async getMe(@Req() req: any) {
        const data = await this.authService.getMe(req.user.userId);
        return new ResponseSuccess('Lấy thông tin người dùng thành công', data);
    }

    @Get('google')
    @GoogleAuthDocs()
    @UseGuards(GoogleOAuthGuard)
    async googleAuth() {
        // Guard tự redirect sang Google, không cần xử lý gì ở đây
    }

    @Get('google/callback')
    @GoogleCallbackDocs()
    @UseGuards(GoogleOAuthGuard)
    async googleCallback(@Request() req, @Res() res: Response) {
        // req.user là kết quả từ GoogleStrategy.validate()
        const { googleAccessToken } = req.user;

        // Redirect về frontend kèm token
        return res.redirect(
            `${this.configService.get('FRONTEND_URL')}/oauth/callback?token=${googleAccessToken}`
        );
    }

}
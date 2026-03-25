import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) {

    }
    async sendWelcome(user: { email: string; name: string }) {
        try {
            await this.mailerService.sendMail({
                to: user.email,
                subject: 'Chào mừng bạn đến với SE-CV',
                template: 'welcome',
                context: {
                    name: user.name,
                    appName: 'SE-CV',
                },
            });

            console.log('Send welcome email success:', user.email);
        } catch (error) {
            console.error('Send welcome email failed');
            console.error(error);

            throw error; // nếu muốn propagate lỗi lên service/controller
        }
    }

    async sendOtp(user: { email: string; name: string }, otp: string) {
        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Mã xác thực OTP của bạn',
            template: 'otp',
            context: {
                name: user.name,
                otp,
                expireMinutes: 5,
            },
        });
    }

    async sendResetPassword(user: { email: string; name: string }, token: string) {
        const resetUrl = `https://myapp.com/reset-password?token=${token}`;
        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Yêu cầu đặt lại mật khẩu',
            template: 'reset-password',
            context: {
                name: user.name,
                resetUrl,
                expireHours: 1,
            },
        });
    }

    async sendVerificationEmail(payload: { email: string; token: string }) {
        const verifyUrl = `${process.env.APP_URL}/auth/verify-email?token=${payload.token}`;

        await this.mailerService.sendMail({
            to: payload.email,
            subject: 'Xác nhận tài khoản của bạn',
            template: 'verify-email',
            context: {
                verifyUrl,
                expireMinutes: 15,
            },
        });
    }

    @OnEvent('company.statusChanged')
    async sendCompanyStatusNotification(payload: { email: string; companyName: string; newStatus: string, note?: string }) {
        let message = '';
        if (payload.newStatus === 'APPROVED') {
            message = `Công ty "${payload.companyName}" của bạn đã được phê duyệt. Bạn có thể bắt đầu đăng tuyển dụng và quản lý công ty.`;
        } else if (payload.newStatus === 'REJECTED') {
            message = `Rất tiếc, công ty "${payload.companyName}" của bạn đã bị từ chối. Vui lòng kiểm tra lại thông tin và thử đăng ký lại.`;
        } else {
            message = `Trạng thái công ty "${payload.companyName}" của bạn đã thay đổi thành ${payload.newStatus}. Vui lòng kiểm tra chi tiết trong phần quản lý công ty.`;
        }
        await this.mailerService.sendMail({
            to: payload.email,
            subject: 'Cập nhật trạng thái công ty',
            template: 'company-status',
            context: {
                companyName: payload.companyName,
                newStatus: payload.newStatus,
                message,
                note: payload.note,
            },
        });
    }
}
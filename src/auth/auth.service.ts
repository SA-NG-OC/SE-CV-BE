import { Injectable, UnauthorizedException, Inject, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { DATABASE_CONNECTION } from '../database/database.module';
import { eq, and } from 'drizzle-orm';
import { InferSelectModel } from 'drizzle-orm';
import { Redis } from 'ioredis';
import { MailService } from 'src/mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { randomInt } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { GoogleUserDto } from './dto/google-user.dto';
import { Role } from 'src/common/types/role.enum';

type User = InferSelectModel<typeof schema.users>;
@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService,
        private mailService: MailService,
        @Inject(DATABASE_CONNECTION) private readonly db: NodePgDatabase<typeof schema>,
        @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    ) { }

    async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }

    async generateTokens(user: Partial<User>) {
        const payload = {
            sub: user.user_id,
            email: user.email,
            roleId: user.role_id
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_se_cv',
                expiresIn: '7d'
            }),
        ])
        return { accessToken, refreshToken }
    }

    async refreshToken(refresh_token: string) {
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(refresh_token, {
                secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_se_cv'
            });
        }
        catch (error) {
            throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
        }

        const [user] = await this.db
            .select()
            .from(schema.users)
            .where(eq(schema.users.user_id, payload.sub))
            .limit(1);
        if (!user) {
            throw new UnauthorizedException('Không tìm thấy thông tin người dùng');
        }
        const tokenInRedis = await this.redisClient.get(`refresh_token:${user.user_id}`);
        if (!tokenInRedis || tokenInRedis !== refresh_token) {
            throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã bị thu hồi');
        }
        const { accessToken, refreshToken } = await this.generateTokens(user);
        await this.redisClient.set(
            `refresh_token:${user.user_id}`,
            refreshToken,
            'EX',
            7 * 24 * 60 * 60
        );
        return {
            accessToken,
            refreshToken: refreshToken
        };
    }

    async register(registerDto: RegisterDto) {
        const { email, password } = registerDto;
        const [existingUser] = await this.db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, email))
            .limit(1);
        if (existingUser) {
            throw new ConflictException('Email đã được sử dụng');
        }
        const passwordHash = await bcrypt.hash(password, 10);

        const payload = { email: email };
        const verificationToken = await this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET || 'refresh_secret_se_cv',
            expiresIn: '15m'
        });

        // Tạo User mới
        const [newUser] = await this.db
            .insert(schema.users)
            .values({
                email: email,
                password_hash: passwordHash,
                is_verified: false,
                verification_token: verificationToken,
                role_id: Role.COMPANY,
            })
            .returning();
        try {
            await this.mailService.sendVerificationEmail({
                email: newUser.email,
                token: verificationToken,
            });
        } catch (error) {
            console.error(`Gửi mail thất bại cho ${email}:`, error.message);
            return {
                message: 'Đăng ký thành công nhưng gửi mail thất bại. Vui lòng dùng chức năng gửi lại mail xác nhận.',
                userId: newUser.user_id,
            };
        }
        return { newUser };
    }

    async verifyEmail(token: string) {
        let payload: { email: string };
        try {
            payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET || 'verify_secret',
            });
        } catch (error) {
            throw new BadRequestException('Link xác nhận không hợp lệ hoặc đã hết hạn');
        }

        if (!payload?.email) {
            throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
        }
        const [user] = await this.db
            .select()
            .from(schema.users)
            .where(
                and(
                    eq(schema.users.email, payload.email),
                    eq(schema.users.verification_token, token),
                ),
            )
            .limit(1);
        if (!user) {
            throw new NotFoundException('Không tìm thấy tài khoản');
        }
        if (user.is_verified) {
            return { message: 'Tài khoản đã được xác nhận trước đó.' };
        }

        await this.db
            .update(schema.users)
            .set({
                is_verified: true,
                verification_token: null, // Xoá token sau khi dùng — chặn dùng lại
                updated_at: new Date(),
            })
            .where(eq(schema.users.email, payload.email));
        return { message: 'Xác thực email thành công' };
    }

    async login(loginDto: LoginDto) {
        const [user] = await this.db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, loginDto.email))
            .limit(1);
        if (!user) {
            throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
        }
        if (!user.is_active) {
            throw new UnauthorizedException('Tài khoản của bạn đang bị khóa');
        }
        if (!user.is_verified) {
            throw new UnauthorizedException('Tài khoản của bạn chưa được xác thực');
        }
        const checkPassword = await bcrypt.compare(loginDto.password, user.password_hash ?? '');
        if (!checkPassword) {
            throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
        }
        const { accessToken, refreshToken } = await this.generateTokens(user);
        await this.redisClient.set(
            `refresh_token:${user.user_id}`,
            refreshToken,
            'EX',
            7 * 24 * 60 * 60
        );
        // Cập nhật thời gian đăng nhập gần nhất
        await this.db
            .update(schema.users)
            .set({ last_login: new Date() })
            .where(eq(schema.users.user_id, user.user_id));

        return {
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                user: user,
                access_token: accessToken,
                refresh_token: refreshToken
            }
        }
    }

    async changePassword(data: ChangePasswordDto) {
        const { userId, oldPassword, newPassword, confirmPassword } = data;
        const [checkUser] = await this.db
            .select()
            .from(schema.users)
            .where(eq(schema.users.user_id, userId))
            .limit(1);
        if (!checkUser) {
            throw new NotFoundException('Không tìm thấy người dùng');
        }
        const isPasswordValid = await bcrypt.compare(oldPassword, checkUser.password_hash ?? '');
        if (!isPasswordValid) {
            throw new BadRequestException('Mật khẩu cũ không chính xác');
        }
        if (newPassword !== confirmPassword) {
            throw new BadRequestException('Mật khẩu mới và xác nhận mật khẩu không khớp');
        }
        const newPasswordHash = await this.hashPassword(newPassword);
        try {
            await this.db
                .update(schema.users)
                .set({ password_hash: newPasswordHash, updated_at: new Date() })
                .where(eq(schema.users.user_id, userId));
            return { message: 'Đổi mật khẩu thành công' };
        } catch (error) {
            console.error('Lỗi khi đổi mật khẩu:', error);
            throw new InternalServerErrorException('Đã xảy ra lỗi khi đổi mật khẩu. Vui lòng thử lại sau.');
        }
    }

    async forgotPassword(email: string): Promise<{ message: string }> {
        // 1. Kiểm tra email tồn tại
        const [user] = await this.db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, email));

        if (!user) {
            // Trả thông báo chung để tránh lộ thông tin tài khoản
            return { message: 'Nếu email tồn tại, OTP đã được gửi đến hộp thư của bạn' };
        }

        // 2. Sinh OTP 6 số
        const otp = randomInt(100000, 999999).toString();
        const OTP_TTL = 5 * 60;

        // 3. Lưu OTP vào Redis với key: otp:<email>
        await this.redisClient.set(`otp:${email}`, otp, 'EX', OTP_TTL);

        // 4. Gửi email OTP
        await this.mailService.sendOtp(
            { email: user.email, name: user.email },
            otp,
        );

        return { message: 'Nếu email tồn tại, OTP đã được gửi đến hộp thư của bạn' };
    }

    async verifyOtp(email: string, otp: string): Promise<{ resetToken: string }> {
        // 1. Lấy OTP từ Redis
        const storedOtp = await this.redisClient.get(`otp:${email}`);

        if (!storedOtp || storedOtp !== otp) {
            throw new BadRequestException('OTP không hợp lệ hoặc đã hết hạn');
        }

        // 2. OTP hợp lệ — xóa khỏi Redis
        await this.redisClient.del(`otp:${email}`);

        // 3. Sinh reset token (UUID), lưu vào Redis 15 phút
        const resetToken = uuidv4();
        const RESET_TTL = 15 * 60; // 15 phút
        await this.redisClient.set(`reset:${resetToken}`, email, 'EX', RESET_TTL);

        return { resetToken };
    }

    async resetPassword(resetToken: string, newPassword: string): Promise<{ message: string }> {
        // 1. Lấy email từ reset token
        const email = await this.redisClient.get(`reset:${resetToken}`);

        if (!email) {
            throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
        }

        // 2. Kiểm tra user tồn tại
        const [user] = await this.db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, email));

        if (!user) {
            throw new NotFoundException('Người dùng không tồn tại');
        }

        // 3. Hash mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 4. Cập nhật DB
        await this.db
            .update(schema.users)
            .set({ password_hash: hashedPassword })
            .where(eq(schema.users.email, email));

        // 5. Xóa reset token khỏi Redis
        await this.redisClient.del(`reset:${resetToken}`);

        return { message: 'Đổi mật khẩu thành công' };
    }

    //Oauth2
    async findOrCreateOAuthUser(googleUser: GoogleUserDto) {
        let [user] = await this.db
            .select()
            .from(schema.users)
            .where(
                and(
                    eq(schema.users.oauth_provider, googleUser.oauth_provider),
                    eq(schema.users.oauth_provider_id, googleUser.oauth_provider_id),
                )
            )
        if (!user) {
            [user] = await this.db
                .select()
                .from(schema.users)
                .where(eq(schema.users.email, googleUser.email));
            if (user) {
                await this.db
                    .update(schema.users)
                    .set({
                        oauth_provider: googleUser.oauth_provider,
                        oauth_provider_id: googleUser.oauth_provider_id,
                        is_verified: true,
                        last_login: new Date(),
                    })
                    .where(eq(schema.users.user_id, user.user_id));
            }
            else {
                [user] = await this.db
                    .insert(schema.users)
                    .values({
                        email: googleUser.email,
                        oauth_provider: googleUser.oauth_provider,
                        oauth_provider_id: googleUser.oauth_provider_id,
                        password_hash: null,
                        role_id: Role.COMPANY,
                        is_active: true,
                        is_verified: true,
                        last_login: new Date(),
                    })
                    .returning();
            }
        }

        const { accessToken, refreshToken } = await this.generateTokens(user);
        await this.redisClient.set(
            `refresh_token:${user.user_id}`,
            refreshToken,
            'EX',
            7 * 24 * 60 * 60
        );
        return {
            email: user.email,
            access_token: accessToken,
            refresh_token: refreshToken
        }
    }
}

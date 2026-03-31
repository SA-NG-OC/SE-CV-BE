import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from "@nestjs/passport";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET')!,
        });
    }

    async validate(payload: any) {
        // đoạn này cần async nên vì sau này sẽ gọi về db để check thêm thông tin user trươc khi return 
        console.log('PAYLOAD', payload);
        return { userId: payload.sub, email: payload.email, roleName: payload.roleName, studentId: payload.studentId, companyId: payload.companyId };
    }
}
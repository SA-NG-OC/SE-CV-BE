import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from "../auth.service";
import { GoogleUserDto } from "../dto/google-user.dto";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refeshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const googleUser: GoogleUserDto = {
            oauth_provider: 'google',
            oauth_provider_id: profile.id,
            email: profile.emails[0].value,
        };
        const user = await this.authService.findOrCreateOAuthUser(googleUser);
        done(null, user);
    }
}
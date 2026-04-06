import { MailerModule } from "@nestjs-modules/mailer";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailService } from "./mail.service";
import { BullModule } from "@nestjs/bullmq";
import { QUEUE_NAMES } from "src/common/constants/queue.constants";
import { MailProcessor } from "./mail.consumer";
@Global()
@Module({
    imports: [
        BullModule.registerQueue({
            name: QUEUE_NAMES.MAIL
        }),
        MailerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                transport: {
                    host: config.get('MAIL_HOST'),
                    port: config.get<number>('MAIL_PORT'),
                    secure: false,
                    auth: {
                        user: config.get('MAIL_USER'),
                        pass: config.get('MAIL_PASS'),
                    },
                },
                defaults: {
                    from: config.get('MAIL_FROM'),
                },
                template: {
                    dir: join(__dirname, 'templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            })
        })
    ],
    providers: [MailService, MailProcessor],
    exports: [MailService, BullModule],
})
export class MailModule { }
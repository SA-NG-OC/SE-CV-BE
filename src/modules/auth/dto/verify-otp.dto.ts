import { z } from "zod";
import { createZodDto } from 'nestjs-zod';
export const verifyOtpSchema = z.object({
    email: z
        .email({ message: 'Email không đúng định dạng' })
        .min(1, { message: 'Email không được để trống' })
        .openapi({ example: 'user@example.com' }),

    otp: z
        .string()
        .length(6, { message: 'OTP phải đúng 6 ký tự' })
        .openapi({ example: '123456' }),
});

export class VerifyOtpDto extends createZodDto(verifyOtpSchema) { }
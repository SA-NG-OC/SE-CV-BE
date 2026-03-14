import { z } from "zod";
import { createZodDto } from 'nestjs-zod';
export const resetPasswordSchema = z.object({
    resetToken: z
        .string()
        .min(1, { message: 'Reset token không được để trống' }),

    newPassword: z
        .string()
        .min(6, { message: 'Mật khẩu phải ít nhất 6 ký tự' }),

    confirmPassword: z
        .string()
        .min(1, { message: 'Xác nhận mật khẩu không được để trống' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
});

export class ResetPasswordDto extends createZodDto(resetPasswordSchema) { }
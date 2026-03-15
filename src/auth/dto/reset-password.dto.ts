import { z } from "zod";
import { createZodDto } from 'nestjs-zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
extendZodWithOpenApi(z);
export const resetPasswordSchema = z.object({
    resetToken: z
        .string()
        .min(1, { message: 'Reset token không được để trống' })
        .openapi({ example: 'eyJhbGciOiJIUzI1NiIsInR5...' }),

    newPassword: z
        .string()
        .min(6, { message: 'Mật khẩu phải ít nhất 6 ký tự' })
        .openapi({ example: 'newPassword123' }),

    confirmPassword: z
        .string()
        .min(1, { message: 'Xác nhận mật khẩu không được để trống' })
        .openapi({ example: 'confirmPassword123' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
});

export class ResetPasswordDto extends createZodDto(resetPasswordSchema) { }
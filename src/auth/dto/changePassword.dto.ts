import { z } from 'zod'
import { createZodDto } from 'nestjs-zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
extendZodWithOpenApi(z);
export const changePasswordSchema = z.object({
    userId: z
        .number({ message: 'Id không hợp lệ' })
        .min(1, { message: 'Id là bắt buộc' })
        .openapi({ example: 123 }),

    oldPassword: z
        .string({ message: 'Kiểu dữ liệu không hợp lệ' })
        .min(6, { message: 'Mật khẩu phải có ít nhất 6 kí tự' })
        .openapi({ example: 'oldPassword123' }),

    newPassword: z
        .string({ message: 'Kiểu dữ liệu không hợp lệ' })
        .min(6, { message: 'Mật khẩu phải có ít nhất 6 kí tự' })
        .openapi({ example: 'newPassword123' }),

    confirmPassword: z
        .string({ message: 'Kiểu dữ liệu không hợp lệ' })
        .min(6, { message: 'Mật khẩu phải có ít nhất 6 kí tự' })
        .openapi({ example: 'confirmPassword123' }),

}).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
});

export class ChangePasswordDto extends createZodDto(changePasswordSchema) { }
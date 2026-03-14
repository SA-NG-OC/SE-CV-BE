import { z } from 'zod'
import { createZodDto } from 'nestjs-zod';

export const changePasswordSchema = z.object({
    userId: z
        .number({ message: 'Id không hợp lệ' })
        .min(1, { message: 'Id là bắt buộc' }),

    oldPassword: z
        .string({ message: 'Kiểu dữ liệu không hợp lệ' })
        .min(6, { message: 'Mật khẩu phải có ít nhất 6 kí tự' }),

    newPassword: z
        .string({ message: 'Kiểu dữ liệu không hợp lệ' })
        .min(6, { message: 'Mật khẩu phải có ít nhất 6 kí tự' }),

    confirmPassword: z
        .string({ message: 'Kiểu dữ liệu không hợp lệ' })
        .min(6, { message: 'Mật khẩu phải có ít nhất 6 kí tự' }),

}).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
});

export class ChangePasswordDto extends createZodDto(changePasswordSchema) { }
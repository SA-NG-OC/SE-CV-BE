import z from 'zod';
import { createZodDto } from 'nestjs-zod';
export const registerScheme = z.object({
    email: z
        .email({ message: 'Email không đúng định dạng' })
        .min(1, { message: 'Email là bắt buộc' }),
    password: z
        .string({ message: 'Dữ liệu ko đúng định dạng' })
        .min(6, { message: 'Mật khẩu phải có ít nhất 6 kí tự' }),
    confirmPassword: z
        .string({ message: 'Dữ liệu ko đúng định dạng' })
        .min(6, { message: 'Mật khẩu phải có ít nhất 6 kí tự' }),
})
    .refine((data) => data.password === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp",
        path: ["confirmPassword"],
    });

export class RegisterDto extends createZodDto(registerScheme) { }
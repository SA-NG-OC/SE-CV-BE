import { z } from "zod";
import { createZodDto } from 'nestjs-zod';
export const loginSchema = z.object({
    email: z
        .email({ message: 'Email không đúng định dạng' })
        .min(1, { message: 'Email không được để trống' }),

    password: z
        .string()
        .min(1, { message: "Mật khẩu không được để trống" })
        .min(6, { message: "Mật khẩu phải ít nhất 6 kí tự" })
});

export class LoginDto extends createZodDto(loginSchema) { }
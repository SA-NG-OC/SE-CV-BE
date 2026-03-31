import { z } from "zod";
import { createZodDto } from 'nestjs-zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
extendZodWithOpenApi(z);
export const loginSchema = z.object({
    email: z
        .email({ message: 'Email không đúng định dạng' })
        .min(1, { message: 'Email không được để trống' })
        .openapi({ example: 'user@example.com' }),

    password: z
        .string()
        .min(1, { message: "Mật khẩu không được để trống" })
        .min(6, { message: "Mật khẩu phải ít nhất 6 kí tự" })
        .openapi({ example: '123456' }),
});

export class LoginDto extends createZodDto(loginSchema) { }
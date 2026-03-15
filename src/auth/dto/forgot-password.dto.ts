import { z } from "zod";
import { createZodDto } from 'nestjs-zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
extendZodWithOpenApi(z);
export const forgotPasswordSchema = z.object({
    email: z
        .email({ message: 'Email không đúng định dạng' })
        .min(1, { message: 'Email không được để trống' })
        .openapi({ example: 'user@example.com' }),
});

export class ForgotPasswordDto extends createZodDto(forgotPasswordSchema) { }
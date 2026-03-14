import { z } from "zod";
import { createZodDto } from 'nestjs-zod';
export const forgotPasswordSchema = z.object({
    email: z
        .email({ message: 'Email không đúng định dạng' })
        .min(1, { message: 'Email không được để trống' }),
});

export class ForgotPasswordDto extends createZodDto(forgotPasswordSchema) { }
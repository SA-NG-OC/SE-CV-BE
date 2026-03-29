import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// User response schema
export const userResponseSchema = z.object({
    userId: z.number().openapi({ example: 1 }),
    email: z.email().openapi({ example: 'admin@test.com' }),
    isActive: z.boolean().openapi({ example: true }).nullable(),
    isVerified: z.boolean().openapi({ example: true }).nullable(),
    role: z.number().nullable(),
});

export class UserResponseDto extends createZodDto(userResponseSchema) { }
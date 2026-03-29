import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// User response schema
export const userResponseSchema = z.object({
    user_id: z.number().openapi({ example: 1 }),
    email: z.email().openapi({ example: 'admin@test.com' }),
    is_active: z.boolean().openapi({ example: true }).nullable(),
    is_verified: z.boolean().openapi({ example: true }).nullable(),
    role: z.string().openapi({ example: 'ADMIN' }).nullable(),
});

export class UserResponseDto extends createZodDto(userResponseSchema) { }
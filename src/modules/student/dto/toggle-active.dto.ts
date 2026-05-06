import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const toggleActiveSchema = z.object({
    isActive: z.boolean(),
});

export class ToggleActiveDto extends createZodDto(toggleActiveSchema) { };
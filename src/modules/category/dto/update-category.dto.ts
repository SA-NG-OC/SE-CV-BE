import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const UpdateJobCategorySchema = z.object({
    category_name: z.string().min(2).max(100),
});

export class UpdateJobCategoryDto extends createZodDto(UpdateJobCategorySchema) { }
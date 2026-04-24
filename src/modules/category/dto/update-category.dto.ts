import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const UpdateJobCategorySchema = z.object({
    categoryName: z.string().min(2).max(100),
});

export class UpdateJobCategoryDto extends createZodDto(UpdateJobCategorySchema) { }
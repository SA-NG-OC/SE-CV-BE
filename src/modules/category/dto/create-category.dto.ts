import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateJobCategorySchema = z.object({
    category_name: z.string()
        .min(2, 'Tên thể loại quá ngắn')
        .max(100, 'Tên thể loại tối đa 100 ký tự'),
});

export class CreateJobCategoryDto extends createZodDto(CreateJobCategorySchema) { }
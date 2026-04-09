import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const GetStudentsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    search: z.string().optional(),
    majorId: z.coerce.number().int().positive().optional(),

    years: z
        .preprocess((val) => (Array.isArray(val) ? val : val ? [val] : []),
            z.array(z.union([z.coerce.number(), z.literal('GRADUATED')]))
        )
        .optional(),

    minGpa: z.coerce.number().min(0).max(4).optional(),

    skillIds: z
        .preprocess((val) => (Array.isArray(val) ? val : val ? [val] : []),
            z.array(z.coerce.number().int().positive())
        )
        .optional(),

    isOpenToWork: z
        .preprocess((val) => val === 'true' || val === true, z.boolean())
        .optional(),
});

export class GetStudentsQueryDto extends createZodDto(GetStudentsQuerySchema) { }
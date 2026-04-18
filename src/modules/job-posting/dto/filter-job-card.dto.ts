import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const JOB_TAGS = ['Pending', 'Hidden', 'Closed', 'Active'] as const;

export const JobPostingFilterSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    search: z.string().trim().optional(),
    tag: z.enum(JOB_TAGS).optional(),
    city: z.string().trim().optional(),
});

export class JobPostingFilterDto extends createZodDto(JobPostingFilterSchema) { }
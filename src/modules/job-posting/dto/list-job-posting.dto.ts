import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const JOB_STATUSES = ['pending', 'approved', 'rejected', 'restricted'] as const;

export const ListJobPostingSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(50).default(10),

    search: z.string().trim().optional(),

    status: z.enum(JOB_STATUSES).optional(),

    city: z.string().trim().optional(),
});

export class ListJobPostingDto extends createZodDto(ListJobPostingSchema) { }
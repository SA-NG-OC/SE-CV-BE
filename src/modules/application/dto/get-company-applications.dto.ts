import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const StatusEnum = z.enum(['submitted', 'interviewing', 'passed', 'rejected']);
export const GetCompanyApplicationsSchema = z.object({
    jobId: z.coerce.number().int().positive('Job ID phải là số nguyên dương').optional(),

    status: z.union([StatusEnum, z.array(StatusEnum)]).optional(),

    dateRange: z.enum(['7days', '30days']).optional(),

    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(50).default(10),
});

export class GetCompanyApplicationsQuery extends createZodDto(GetCompanyApplicationsSchema) { }
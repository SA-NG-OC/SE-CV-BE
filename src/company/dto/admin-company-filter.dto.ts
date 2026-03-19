import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const AdminCompanyFilterSchema = z.object({
    page: z.coerce.number().min(1).default(1),

    limit: z.coerce.number().min(1).max(100).default(10),

    status: z.enum(["PENDING", "APPROVED", "REJECTED", "RESTRICTED"]).optional(),
});

export class AdminCompanyFilterDto extends createZodDto(AdminCompanyFilterSchema) { }
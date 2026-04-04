import z from 'zod'
import { createZodDto } from 'nestjs-zod';
import { companyStatus } from 'src/common/types/comapny-status.enum';

export const ChangeCompanyStatusSchema = z.object({
    status: z.enum(companyStatus, {
        message: 'Status không hợp lệ'
    }),
    admin_note: z.string().optional().nullable(),
});

export class ChangeCompanyStatusDto extends createZodDto(ChangeCompanyStatusSchema) { }
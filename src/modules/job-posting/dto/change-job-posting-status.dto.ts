import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ChangeJobPostingStatusSchema = z.object({
    status: z.enum(['pending', 'approved', 'rejected', 'restricted'], {
        message: 'Status không hợp lệ',
    }),
    admin_note: z.string().max(500).optional().nullable(),
});

export class ChangeJobPostingStatusDto extends createZodDto(ChangeJobPostingStatusSchema) { }
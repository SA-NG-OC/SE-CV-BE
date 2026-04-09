import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ChangeApplicationStatusSchema = z.object({
    status: z.enum(['interviewing', 'passed', 'rejected'], {
        message: 'Trạng thái không hợp lệ',
    }),
});

export class ChangeApplicationStatusDto extends createZodDto(ChangeApplicationStatusSchema) { }
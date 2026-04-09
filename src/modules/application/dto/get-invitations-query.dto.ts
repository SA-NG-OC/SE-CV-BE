import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const GetInvitationsQuerySchema = z.object({
    status: z
        .enum(['pending', 'accepted', 'rejected', 'expired'], {
            message: 'Trạng thái không hợp lệ',
        })
        .optional(),
});

export class GetInvitationsQueryDto extends createZodDto(GetInvitationsQuerySchema) { }
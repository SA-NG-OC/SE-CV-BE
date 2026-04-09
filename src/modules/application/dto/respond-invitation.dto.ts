// dto/respond-invitation.dto.ts
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const RespondInvitationSchema = z.object({
    action: z.enum(['accept', 'reject']),
    cvUrl: z.string().url().optional(), // Cần thiết nếu chọn 'accept'
});

export class RespondInvitationDto extends createZodDto(RespondInvitationSchema) { }
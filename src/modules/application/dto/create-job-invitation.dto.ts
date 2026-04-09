import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateJobInvitationSchema = z.object({
    jobId: z.coerce
        .number()
        .int()
        .positive('ID tin tuyển dụng phải là số nguyên dương'),

    studentId: z.coerce
        .number()
        .int()
        .positive('ID sinh viên phải là số nguyên dương'),

    message: z
        .string()
        .max(1000, 'Lời nhắn không được vượt quá 1000 ký tự')
        .optional()
        .transform((val) => val?.trim() || null),
});

export class CreateJobInvitationDto extends createZodDto(CreateJobInvitationSchema) { }
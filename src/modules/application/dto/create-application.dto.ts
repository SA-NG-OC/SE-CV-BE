import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateApplicationSchema = z.object({
    jobId: z.coerce
        .number()
        .int()
        .positive('Job ID phải là số nguyên dương'),

    cvUrl: z
        .string()
        .url('CV URL không hợp lệ')
        .max(500, 'CV URL không được vượt quá 500 ký tự'),

    coverLetter: z
        .string()
        .min(20, 'Thư xin việc phải có ít nhất 20 ký tự')
        .optional(),
});

export class CreateApplicationDto extends createZodDto(CreateApplicationSchema) { }
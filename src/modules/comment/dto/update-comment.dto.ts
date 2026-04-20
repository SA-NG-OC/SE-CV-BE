import { createZodDto } from "nestjs-zod";
import z from 'zod';

export const UpdateCommentSchema = z.object({
    ratting: z.number().int().min(1).max(5).optional(),
    content: z.string().min(1).max(1000).optional(),
});

export class UpdateCommentDto extends createZodDto(UpdateCommentSchema) { };
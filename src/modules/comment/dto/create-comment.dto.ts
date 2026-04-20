import { createZodDto } from "nestjs-zod";
import z from 'zod';

export const CreateCommentSchema = z.object({
    companyId: z.number().int().positive(),
    ratting: z.number().min(1).max(5),
    content: z.string().min(1).max(1000),
});

export class CreateCommentDto extends createZodDto(CreateCommentSchema) { };
// notifications.dto.ts
import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const createNotificationSchema = z.object({
    user_id: z.number(),
    type: z.string().max(50).optional(),
    title: z.string().min(1).max(255),
    message: z.string().min(1),
    link: z.string().url().max(500).optional(),
});

export class CreateNotificationDto extends createZodDto(createNotificationSchema) { }

export const markReadSchema = z.object({
    notificationIds: z.array(z.number()).optional(),
});

export class MarkReadDto extends createZodDto(markReadSchema) { }
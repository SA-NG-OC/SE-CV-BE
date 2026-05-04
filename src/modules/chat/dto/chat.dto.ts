import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const getOrCreateConversationSchema = z.object({
    studentId: z.coerce
        .number()
        .int()
        .positive()
        .openapi({ example: 12, description: 'ID của student' }),

    companyId: z.coerce
        .number()
        .int()
        .positive()
        .openapi({ example: 5, description: 'ID của company' }),
});
export class GetOrCreateConversationDto extends createZodDto(getOrCreateConversationSchema) { }

export const sendMessageSchema = z.object({
    conversationId: z.coerce
        .number()
        .int()
        .positive()
        .openapi({ example: 10 }),

    content: z
        .string()
        .min(1, { message: 'Nội dung không được để trống' })
        .max(5000, { message: 'Nội dung tối đa 5000 ký tự' })
        .openapi({ example: 'Xin chào, tôi quan tâm vị trí Backend Developer' }),
});
export class SendMessageDto extends createZodDto(sendMessageSchema) { }

export const wsMessageSchema = sendMessageSchema;
export class WsMessageDto extends createZodDto(wsMessageSchema) { }

export const markReadSchema = z.object({
    conversationId: z.coerce.number().int().positive().openapi({ example: 10 }),
    messageId: z.coerce.number().int().positive().openapi({ example: 120 }),
});
export class MarkReadDto extends createZodDto(markReadSchema) { }

export const getMessagesSchema = z.object({
    cursor: z.coerce
        .number()
        .int()
        .positive()
        .optional()
        .openapi({ example: 50 }),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(50)
        .default(20)
        .openapi({ example: 20 }),
});
export class GetMessagesDto extends createZodDto(getMessagesSchema) { }

export const setHiddenSchema = z.object({
    conversationId: z.coerce.number().int().positive().openapi({ example: 10 }),
    hidden: z.boolean().openapi({ example: true }),
});
export class SetHiddenDto extends createZodDto(setHiddenSchema) { }

export const setBlockedSchema = z.object({
    conversationId: z.coerce.number().int().positive().openapi({ example: 10 }),
    blocked: z.boolean().openapi({ example: true }),
});
export class SetBlockedDto extends createZodDto(setBlockedSchema) { }
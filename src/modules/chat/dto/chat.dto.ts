import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const getOrCreateConversationSchema = z.object({
    studentId: z.number().int().positive(),
    companyId: z.number().int().positive(),
});
export class GetOrCreateConversationDto extends createZodDto(getOrCreateConversationSchema) { }

export const sendMessageSchema = z.object({
    conversationId: z.number().int().positive(),
    content: z.string().min(1).max(5000),
});
export class SendMessageDto extends createZodDto(sendMessageSchema) { }

export const wsMessageSchema = z.object({
    conversationId: z.number().int().positive(),
    content: z.string().min(1).max(5000),
});
export class WsMessageDto extends createZodDto(wsMessageSchema) { }

export const markReadSchema = z.object({
    conversationId: z.number().int().positive(),
    messageId: z.number().int().positive(),
});
export class MarkReadDto extends createZodDto(markReadSchema) { }

export const getMessagesSchema = z.object({
    cursor: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});
export class GetMessagesDto extends createZodDto(getMessagesSchema) { }

// ── Ẩn / bỏ ẩn ────────────────────────────────────────────────────────────
export const setHiddenSchema = z.object({
    conversationId: z.number().int().positive(),
    hidden: z.boolean(),
});
export class SetHiddenDto extends createZodDto(setHiddenSchema) { }

// ── Block / unblock ────────────────────────────────────────────────────────
export const setBlockedSchema = z.object({
    conversationId: z.number().int().positive(),
    blocked: z.boolean(),
});
export class SetBlockedDto extends createZodDto(setBlockedSchema) { }
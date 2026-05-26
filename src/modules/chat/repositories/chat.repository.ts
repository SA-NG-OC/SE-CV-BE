import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, lt, desc, sql, ilike, count, aliasedTable } from 'drizzle-orm';
import * as schema from '../../../database/schema';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import { ConversationEntity, ConversationParticipantEntity, MessageEntity } from '../domain/chat.entity';
import { IChatRepository, IConversationListRaw, IGetMessagesOptions } from './chat-repository.interface';
import { ISendContext } from '../types';
import { Redis } from 'ioredis';

const TTL = {
    SEND_CONTEXT: 300,
    PARTICIPANT: 600,
    UNREAD: 60,
} as const;

const KEY = {
    sendContext: (cid: number) => `send_ctx:${cid}`,
    participant: (cid: number, uid: number) => `participant:${cid}:${uid}`,
    unread: (cid: number, uid: number) => `unread:${cid}:${uid}`,
};

@Injectable()
export class ChatRepository implements IChatRepository {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,
        @Inject('REDIS_CLIENT')
        private readonly redis: Redis,
    ) { }

    // =========================================================================
    // REDIS HELPERS
    // =========================================================================

    private async cacheGet<T>(key: string): Promise<T | null> {
        const raw = await this.redis.get(key);
        return raw ? (JSON.parse(raw) as T) : null;
    }

    private async cacheSet(key: string, ttl: number, value: unknown): Promise<void> {
        await this.redis.setex(key, ttl, JSON.stringify(value));
    }

    private async cacheDel(...keys: string[]): Promise<void> {
        if (keys.length) await this.redis.del(...keys);
    }

    // =========================================================================
    // VALIDATE SEND CONTEXT  
    // =========================================================================

    async validateSendContext(conversationId: number, senderId: number): Promise<ISendContext> {
        type Row = { user_id: number; is_blocked: boolean };
        const cacheKey = KEY.sendContext(conversationId);

        let rows = await this.cacheGet<Row[]>(cacheKey);

        if (!rows) {
            rows = await this.db
                .select({
                    user_id: schema.conversation_participants.user_id,
                    is_blocked: schema.conversation_participants.is_blocked,
                })
                .from(schema.conversation_participants)
                .where(eq(schema.conversation_participants.conversation_id, conversationId));

            await this.cacheSet(cacheKey, TTL.SEND_CONTEXT, rows);
        }

        return {
            isMember: rows.some((r) => r.user_id === senderId),
            isBlocked: rows.some((r) => r.is_blocked),
            recipientIds: rows.map((r) => r.user_id).filter((id) => id !== senderId),
        };
    }
    // =========================================================================
    // CONVERSATION
    // =========================================================================

    async findConversationByCompanyAndStudent(
        companyId: number,
        studentId: number,
    ): Promise<ConversationEntity | null> {
        const [row] = await this.db
            .select()
            .from(schema.conversations)
            .where(
                and(
                    eq(schema.conversations.company_id, companyId),
                    eq(schema.conversations.student_id, studentId),
                ),
            )
            .limit(1);
        return row ?? null;
    }

    async createConversation(
        data: Omit<ConversationEntity, 'conversation_id'>,
    ): Promise<ConversationEntity> {
        const [row] = await this.db
            .insert(schema.conversations)
            .values(data)
            .returning();
        return row;
    }

    async updateLastMessageAt(conversationId: number): Promise<void> {
        await this.db
            .update(schema.conversations)
            .set({ last_message_at: new Date() })
            .where(eq(schema.conversations.conversation_id, conversationId));
    }

    // =========================================================================
    // PARTICIPANTS  
    // =========================================================================

    async findParticipant(
        conversationId: number,
        userId: number,
    ): Promise<ConversationParticipantEntity | null> {
        const cacheKey = KEY.participant(conversationId, userId);

        const cached = await this.cacheGet<ConversationParticipantEntity>(cacheKey);
        if (cached) return cached;

        const [row] = await this.db
            .select()
            .from(schema.conversation_participants)
            .where(
                and(
                    eq(schema.conversation_participants.conversation_id, conversationId),
                    eq(schema.conversation_participants.user_id, userId),
                ),
            )
            .limit(1);

        const result = row ?? null;
        if (result) await this.cacheSet(cacheKey, TTL.PARTICIPANT, result);
        return result;
    }

    async createParticipant(
        data: Omit<ConversationParticipantEntity, 'participant_id'>,
    ): Promise<ConversationParticipantEntity> {
        const [row] = await this.db
            .insert(schema.conversation_participants)
            .values(data)
            .returning();

        // Invalidate send_ctx vì danh sách participants thay đổi
        await this.cacheDel(KEY.sendContext(data.conversation_id));

        return row;
    }

    async updateLastRead(
        conversationId: number,
        userId: number,
        messageId: number,
    ): Promise<void> {
        await this.db
            .update(schema.conversation_participants)
            .set({ last_read_message_id: messageId, updated_at: new Date() })
            .where(
                and(
                    eq(schema.conversation_participants.conversation_id, conversationId),
                    eq(schema.conversation_participants.user_id, userId),
                ),
            );

        await this.cacheDel(
            KEY.participant(conversationId, userId),
            KEY.unread(conversationId, userId),
        );
    }

    async setHidden(
        conversationId: number,
        userId: number,
        hidden: boolean,
    ): Promise<ConversationParticipantEntity> {
        const [row] = await this.db
            .update(schema.conversation_participants)
            .set({ is_hidden: hidden, updated_at: new Date() })
            .where(
                and(
                    eq(schema.conversation_participants.conversation_id, conversationId),
                    eq(schema.conversation_participants.user_id, userId),
                ),
            )
            .returning();

        await this.cacheDel(KEY.participant(conversationId, userId));
        return row;
    }

    async setBlocked(
        conversationId: number,
        userId: number,
        blocked: boolean,
    ): Promise<ConversationParticipantEntity> {
        const [row] = await this.db
            .update(schema.conversation_participants)
            .set({ is_blocked: blocked, updated_at: new Date() })
            .where(
                and(
                    eq(schema.conversation_participants.conversation_id, conversationId),
                    eq(schema.conversation_participants.user_id, userId),
                ),
            )
            .returning();

        // Invalidate cả hai: entity lẫn send_ctx (is_blocked đã đổi)
        await this.cacheDel(
            KEY.participant(conversationId, userId),
            KEY.sendContext(conversationId),
        );

        return row;
    }

    async getParticipantUserIds(conversationId: number): Promise<number[]> {
        const rows = await this.db
            .select({ user_id: schema.conversation_participants.user_id })
            .from(schema.conversation_participants)
            .where(eq(schema.conversation_participants.conversation_id, conversationId));
        return rows.map((r) => r.user_id);
    }

    async hasAnyBlocked(conversationId: number): Promise<boolean> {
        const [row] = await this.db
            .select({ participant_id: schema.conversation_participants.participant_id })
            .from(schema.conversation_participants)
            .where(
                and(
                    eq(schema.conversation_participants.conversation_id, conversationId),
                    eq(schema.conversation_participants.is_blocked, true),
                ),
            )
            .limit(1);
        return row !== undefined;
    }

    async isParticipant(conversationId: number, userId: number): Promise<boolean> {
        const row = await this.findParticipant(conversationId, userId);
        return row !== null;
    }

    // =========================================================================
    // MESSAGES
    // =========================================================================

    async createMessageAndUpdateConversation(
        data: Omit<MessageEntity, 'message_id'>,
    ): Promise<MessageEntity> {
        return this.db.transaction(async (tx) => {
            const [saved] = await tx
                .insert(schema.messages)
                .values(data)
                .returning();

            await tx
                .update(schema.conversations)
                .set({ last_message_at: saved.created_at })
                .where(eq(schema.conversations.conversation_id, data.conversation_id));

            await tx
                .update(schema.conversation_participants)
                .set({ is_hidden: false })
                .where(eq(schema.conversation_participants.user_id, data.sender_id));

            return saved;
        });
    }

    async getMessages(opts: IGetMessagesOptions): Promise<MessageEntity[]> {
        const { conversationId, cursor, limit } = opts;
        const conditions = [eq(schema.messages.conversation_id, conversationId)];
        if (cursor) conditions.push(lt(schema.messages.message_id, cursor));

        const rows = await this.db
            .select()
            .from(schema.messages)
            .where(and(...conditions))
            .orderBy(desc(schema.messages.message_id))
            .limit(limit);

        return rows.reverse();
    }

    async findMessageById(messageId: number): Promise<MessageEntity | null> {
        const [row] = await this.db
            .select()
            .from(schema.messages)
            .where(eq(schema.messages.message_id, messageId))
            .limit(1);
        return row ?? null;
    }

    // =========================================================================
    // UNREAD COUNT  
    // =========================================================================

    async getUnreadCount(conversationId: number, userId: number): Promise<number> {
        const cacheKey = KEY.unread(conversationId, userId);

        const cached = await this.cacheGet<number>(cacheKey);
        if (cached !== null) return cached;

        const participant = await this.findParticipant(conversationId, userId);
        const lastReadId = participant?.last_read_message_id ?? null;

        const conditions = [
            eq(schema.messages.conversation_id, conversationId),
            sql`${schema.messages.sender_id} <> ${userId}`,
            ...(lastReadId
                ? [sql`${schema.messages.message_id} > ${lastReadId}`]
                : []),
        ];

        const [{ cnt }] = await this.db
            .select({ cnt: sql<number>`COUNT(*)::int` })
            .from(schema.messages)
            .where(and(...conditions));

        await this.cacheSet(cacheKey, TTL.UNREAD, cnt);
        return cnt;
    }

    // =========================================================================
    // CONVERSATION LIST
    // =========================================================================

    async getConversationListForUser(
        userId: number,
        role: 'student' | 'company',
        query: { page: number; limit: number; search?: string },
    ): Promise<{ rows: any[]; total: number }> {
        const { page, limit, search } = query;
        const offset = (page - 1) * limit;

        const partnerParticipants = aliasedTable(
            schema.conversation_participants,
            'partner_participants'
        );

        const last_message_content = sql<string>`
      (SELECT m.content FROM ${schema.messages} m
       WHERE m.conversation_id = ${schema.conversations.conversation_id}
       ORDER BY m.message_id DESC LIMIT 1)
    `.as('last_message_content');

        const last_message_sender_id = sql<number>`
      (SELECT m.sender_id FROM ${schema.messages} m
       WHERE m.conversation_id = ${schema.conversations.conversation_id}
       ORDER BY m.message_id DESC LIMIT 1)
    `.as('last_message_sender_id');

        const last_message_created_at = sql<Date>`
      (SELECT m.created_at FROM ${schema.messages} m
       WHERE m.conversation_id = ${schema.conversations.conversation_id}
       ORDER BY m.message_id DESC LIMIT 1)
    `.as('last_message_created_at');

        const unread_count = sql<number>`
      (SELECT COUNT(*)::int FROM ${schema.messages} m2
       WHERE m2.conversation_id = ${schema.conversations.conversation_id}
         AND m2.sender_id <> ${userId}
         AND (
           ${schema.conversation_participants.last_read_message_id} IS NULL
           OR m2.message_id > ${schema.conversation_participants.last_read_message_id}
         ))
    `.as('unread_count');

        const last_message_has_images = sql<boolean>`
        (SELECT (array_length(m.image_urls, 1) > 0)
         FROM ${schema.messages} m
         WHERE m.conversation_id = ${schema.conversations.conversation_id}
         ORDER BY m.message_id DESC LIMIT 1)
    `.as('last_message_has_images');

        const baseConditions = [eq(schema.conversation_participants.user_id, userId)];

        // ── STUDENT VIEW ──────────────────────────────────────────────────────
        if (role === 'student') {
            const conditions = [...baseConditions];
            if (search) conditions.push(ilike(schema.companies.company_name, `%${search}%`));
            const where = and(...conditions);

            const [{ total }] = await this.db
                .select({ total: count() })
                .from(schema.conversations)
                .innerJoin(
                    schema.conversation_participants,
                    eq(schema.conversation_participants.conversation_id, schema.conversations.conversation_id),
                )
                .innerJoin(schema.companies, eq(schema.companies.company_id, schema.conversations.company_id))
                .where(where);

            const rows = await this.db
                .select({
                    conversation_id: schema.conversations.conversation_id,
                    last_message_at: schema.conversations.last_message_at,
                    created_at: schema.conversations.created_at,
                    is_hidden: schema.conversation_participants.is_hidden,
                    is_blocked: schema.conversation_participants.is_blocked,

                    is_blocked_by_partner: partnerParticipants.is_blocked,

                    last_message_content,
                    last_message_has_images,
                    last_message_sender_id,
                    last_message_created_at,
                    unread_count,
                    partner_id: schema.companies.company_id,
                    partner_name: schema.companies.company_name,
                    partner_avatar: schema.companies.logo_url,
                })
                .from(schema.conversations)
                .innerJoin(
                    schema.conversation_participants,
                    eq(schema.conversation_participants.conversation_id, schema.conversations.conversation_id),
                )
                .innerJoin(schema.companies, eq(schema.companies.company_id, schema.conversations.company_id))
                .leftJoin(
                    partnerParticipants,
                    and(
                        eq(partnerParticipants.conversation_id, schema.conversations.conversation_id),
                        sql`${partnerParticipants.user_id} <> ${userId}`
                    )
                )
                .where(where)
                .orderBy(desc(schema.conversations.last_message_at))
                .limit(limit)
                .offset(offset);

            return { rows, total: Number(total) };
        }

        // ── COMPANY VIEW ──────────────────────────────────────────────────────
        const conditions = [...baseConditions];
        if (search) conditions.push(ilike(schema.students.full_name, `%${search}%`));
        const where = and(...conditions);

        const [{ total }] = await this.db
            .select({ total: count() })
            .from(schema.conversations)
            .innerJoin(
                schema.conversation_participants,
                eq(schema.conversation_participants.conversation_id, schema.conversations.conversation_id),
            )
            .innerJoin(schema.students, eq(schema.students.student_id, schema.conversations.student_id))
            .where(where);

        const rows = await this.db
            .select({
                conversation_id: schema.conversations.conversation_id,
                last_message_at: schema.conversations.last_message_at,
                created_at: schema.conversations.created_at,
                is_hidden: schema.conversation_participants.is_hidden,
                is_blocked: schema.conversation_participants.is_blocked,

                is_blocked_by_partner: partnerParticipants.is_blocked,

                last_message_content,
                last_message_has_images,
                last_message_sender_id,
                last_message_created_at,
                unread_count,
                partner_id: schema.students.student_id,
                partner_name: schema.students.full_name,
                partner_avatar: schema.students.avatar_url,
            })
            .from(schema.conversations)
            .innerJoin(
                schema.conversation_participants,
                eq(schema.conversation_participants.conversation_id, schema.conversations.conversation_id),
            )
            .innerJoin(schema.students, eq(schema.students.student_id, schema.conversations.student_id))

            .leftJoin(
                partnerParticipants,
                and(
                    eq(partnerParticipants.conversation_id, schema.conversations.conversation_id),
                    sql`${partnerParticipants.user_id} <> ${userId}`
                )
            )
            .where(where)
            .orderBy(desc(schema.conversations.last_message_at))
            .limit(limit)
            .offset(offset);

        return { rows, total: Number(total) };
    }
}
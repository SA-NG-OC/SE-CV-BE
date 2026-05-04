import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, lt, desc, sql } from 'drizzle-orm';
import * as schema from '../../../database/schema';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import { ConversationEntity, ConversationParticipantEntity, MessageEntity } from '../domain/chat.entity';
import { IChatRepository, IConversationListRaw, IGetMessagesOptions } from './chat-repository.interface';
import { ISendContext } from '../types';

@Injectable()
export class ChatRepository implements IChatRepository {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,
    ) { };

    async validateSendContext(conversationId: number, senderId: number): Promise<ISendContext> {
        const rows = await this.db
            .select({
                user_id: schema.conversation_participants.user_id,
                is_blocked: schema.conversation_participants.is_blocked,
            })
            .from(schema.conversation_participants)
            .where(eq(schema.conversation_participants.conversation_id, conversationId));

        const isMember = rows.some((r) => r.user_id === senderId);
        const isBlocked = rows.some((r) => r.is_blocked);
        const recipientIds = rows
            .map((r) => r.user_id)
            .filter((id) => id !== senderId);

        return { isMember, isBlocked, recipientIds };
    }

    //CONVERSATION
    async findConversationByCompanyAndStudent(companyId: number, studentId: number): Promise<ConversationEntity | null> {
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

    async createConversation(data: Omit<ConversationEntity, 'conversation_id'>): Promise<ConversationEntity> {
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

    // PARTICIPANTS
    async createParticipant(
        data: Omit<ConversationParticipantEntity, 'participant_id'>,
    ): Promise<ConversationParticipantEntity> {
        const [row] = await this.db
            .insert(schema.conversation_participants)
            .values(data)
            .returning();
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

    async findParticipant(
        conversationId: number,
        userId: number,
    ): Promise<ConversationParticipantEntity | null> {
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
        return row ?? null;
    }

    async isParticipant(conversationId: number, userId: number): Promise<boolean> {
        const row = await this.findParticipant(conversationId, userId);
        return row !== null;
    }

    async setHidden(conversationId: number, userId: number, hidden: boolean): Promise<ConversationParticipantEntity> {
        const [conversation] = await this.db
            .update(schema.conversation_participants)
            .set({ is_hidden: hidden, updated_at: new Date() })
            .where(
                and(
                    eq(schema.conversation_participants.conversation_id, conversationId),
                    eq(schema.conversation_participants.user_id, userId),
                ),
            ).returning();
        return conversation;
    }

    async setBlocked(conversationId: number, userId: number, blocked: boolean): Promise<ConversationParticipantEntity> {
        const [conversation] = await this.db
            .update(schema.conversation_participants)
            .set({ is_blocked: blocked, updated_at: new Date() })
            .where(
                and(
                    eq(schema.conversation_participants.conversation_id, conversationId),
                    eq(schema.conversation_participants.user_id, userId),
                ),
            ).returning();
        return conversation;
    }

    //MESSAGE
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

    async getConversationListForUser(
        userId: number,
        role: 'student' | 'company',
    ): Promise<IConversationListRaw[]> {

        const lastMessageContent = sql<string>`
        (
            SELECT m.content
            FROM ${schema.messages} m
            WHERE m.conversation_id = ${schema.conversations.conversation_id}
            ORDER BY m.message_id DESC
            LIMIT 1
        )
    `.as('last_message_content');

        const lastMessageSenderId = sql<number>`
        (
            SELECT m.sender_id
            FROM ${schema.messages} m
            WHERE m.conversation_id = ${schema.conversations.conversation_id}
            ORDER BY m.message_id DESC
            LIMIT 1
        )
    `.as('last_message_sender_id');

        const lastMessageCreatedAt = sql<Date>`
        (
            SELECT m.created_at
            FROM ${schema.messages} m
            WHERE m.conversation_id = ${schema.conversations.conversation_id}
            ORDER BY m.message_id DESC
            LIMIT 1
        )
    `.as('last_message_created_at');

        const unreadCount = sql<number>`
        (
            SELECT COUNT(*)::int
            FROM ${schema.messages} m2
            WHERE m2.conversation_id = ${schema.conversations.conversation_id}
              AND m2.sender_id <> ${userId}
              AND (
                    ${schema.conversation_participants.last_read_message_id} IS NULL
                    OR m2.message_id > ${schema.conversation_participants.last_read_message_id}
              )
        )
    `.as('unread_count');

        // join theo role
        if (role === 'student') {
            const results = await this.db
                .select({
                    conversation_id: schema.conversations.conversation_id,
                    last_message_at: schema.conversations.last_message_at,
                    created_at: schema.conversations.created_at,

                    is_hidden: schema.conversation_participants.is_hidden,
                    is_blocked: schema.conversation_participants.is_blocked,

                    last_message_content: lastMessageContent,
                    last_message_sender_id: lastMessageSenderId,
                    last_message_created_at: lastMessageCreatedAt,

                    unread_count: unreadCount,

                    partner_id: schema.companies.company_id,
                    partner_name: schema.companies.company_name,
                    partner_avatar: schema.companies.logo_url,
                })
                .from(schema.conversations)
                .innerJoin(
                    schema.conversation_participants,
                    and(
                        eq(schema.conversation_participants.conversation_id, schema.conversations.conversation_id),
                        eq(schema.conversation_participants.user_id, userId)
                    )
                )
                .innerJoin(
                    schema.companies,
                    eq(schema.companies.company_id, schema.conversations.company_id)
                )
                .orderBy(desc(schema.conversations.last_message_at));

            return results;
        }
        const results = await this.db
            .select({
                conversation_id: schema.conversations.conversation_id,
                last_message_at: schema.conversations.last_message_at,
                created_at: schema.conversations.created_at,

                is_hidden: schema.conversation_participants.is_hidden,
                is_blocked: schema.conversation_participants.is_blocked,

                last_message_content: lastMessageContent,
                last_message_sender_id: lastMessageSenderId,
                last_message_created_at: lastMessageCreatedAt,

                unread_count: unreadCount,

                partner_id: schema.students.student_id,
                partner_name: schema.students.full_name,
                partner_avatar: schema.students.avatar_url,
            })
            .from(schema.conversations)
            .innerJoin(
                schema.conversation_participants,
                and(
                    eq(schema.conversation_participants.conversation_id, schema.conversations.conversation_id),
                    eq(schema.conversation_participants.user_id, userId)
                )
            )
            .innerJoin(
                schema.students,
                eq(schema.students.student_id, schema.conversations.student_id)
            )
            .innerJoin(
                schema.users,
                eq(schema.users.user_id, schema.students.user_id)
            )
            .orderBy(desc(schema.conversations.last_message_at));

        return results;
    }

}
import { ConversationEntity, MessageEntity, ConversationParticipantEntity } from '../domain/chat.entity';

export interface IGetMessagesOptions {
    conversationId: number;
    cursor?: number;
    limit: number;
}

export interface IConversationListRaw {
    conversation_id: number;
    last_message_at: Date | null;
    created_at: Date | null;
    unread_count: number;
    is_hidden: boolean;
    is_blocked: boolean;
    last_message_content: string | null;
    last_message_sender_id: number | null;
    last_message_created_at: Date | null;
    partner_id: number;
    partner_name: string;
    partner_avatar: string | null;
}

export interface IChatRepository {
    // Conversations
    findConversationByCompanyAndStudent(companyId: number, studentId: number): Promise<ConversationEntity | null>;
    createConversation(data: Omit<ConversationEntity, 'conversation_id'>): Promise<ConversationEntity>;
    updateLastMessageAt(conversationId: number): Promise<void>

    // Participants
    findParticipant(
        conversationId: number,
        userId: number,
    ): Promise<ConversationParticipantEntity | null>
    createParticipant(data: Omit<ConversationParticipantEntity, 'participant_id'>): Promise<ConversationParticipantEntity>;
    updateLastRead(conversationId: number, userId: number, messageId: number): Promise<void>;
    getParticipantUserIds(conversationId: number): Promise<number[]>;
    isParticipant(conversationId: number, userId: number): Promise<boolean>;
    hasAnyBlocked(conversationId: number): Promise<boolean>

    // Hide / Block
    setHidden(conversationId: number, userId: number, hidden: boolean): Promise<ConversationParticipantEntity>;
    setBlocked(conversationId: number, userId: number, blocked: boolean): Promise<ConversationParticipantEntity>;

    // Messages
    createMessage(data: Omit<MessageEntity, 'message_id'>): Promise<MessageEntity>;
    getMessages(opts: IGetMessagesOptions): Promise<MessageEntity[]>;
    findMessageById(messageId: number): Promise<MessageEntity | null>;

    // Conversation list
    getConversationListForUser(userId: number, role: 'student' | 'company'): Promise<IConversationListRaw[]>;
}

export const CHAT_REPOSITORY = 'CHAT_REPOSITORY';
export type ParticipantStatus = 'active' | 'hidden' | 'blocked';

export interface ConversationProps {
    id: number;
    companyId: number;
    studentId: number;
    lastMessageAt: Date | null;
    createdAt: Date | null;
}

export interface MessageProps {
    id: number;
    conversationId: number;
    senderId: number;
    content: string;
    createdAt: Date;
    updatedAt: Date | null;
}

export interface ParticipantProps {
    id: number;
    conversationId: number;
    userId: number;
    status: ParticipantStatus;
    lastReadMessageId: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}
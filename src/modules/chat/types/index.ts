export interface MessageView {
    messageId: number;
    conversationId: number;
    senderId: number;
    content: string;
    createdAt: Date;
    isMine: boolean;
}

export interface ConversationListItemView {
    conversationId: number;
    lastMessageAt: Date | null;
    createdAt: Date | null;
    unreadCount: number;
    lastMessage: {
        content: string;
        senderId: number;
        createdAt: Date;
    } | null;
    partner: {
        id: number;
        name: string;
        avatarUrl: string | null;
    };
}

export interface ParticipantStatusView {
    userId: number;
    conversationId: number;
    isHidden: boolean;
    isBlocked: boolean;
    lastReadMessageId: number | null;
}


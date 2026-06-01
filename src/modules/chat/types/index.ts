export interface MessageView {
  messageId: number;
  conversationId: number;
  senderId: number;
  content: string | null;
  imageUrls: string[];
  createdAt: Date;
  isMine: boolean;
}

export interface ConversationListItemView {
  conversationId: number;
  lastMessageAt: Date | null;
  createdAt: Date | null;
  unreadCount: number;
  isHidden: boolean;
  isBlocked: boolean;
  isBlockedByPartner: boolean;
  lastMessage: {
    content: string | null;
    hasImages: boolean;
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

export interface ISendContext {
  isMember: boolean;
  isBlocked: boolean;
  recipientIds: number[];
}

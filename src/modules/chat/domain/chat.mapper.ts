import {
  ConversationListItemView,
  MessageView,
  ParticipantStatusView,
} from '../types';
import { ConversationParticipantEntity, MessageEntity } from './chat.entity';

export class ChatMapper {
  static toMessageView(raw: MessageEntity, requesterId: number): MessageView {
    return {
      messageId: raw.message_id,
      conversationId: raw.conversation_id,
      senderId: raw.sender_id,
      content: raw.content || null,
      imageUrls: raw.image_urls ?? [],
      createdAt: raw.created_at,
      isMine: raw.sender_id === requesterId,
    };
  }

  static toConversationListItemView(raw: {
    conversation_id: number;
    last_message_at: Date | null;
    created_at: Date | null;
    unread_count: number;
    last_message_content: string | null;
    last_message_has_images: boolean;
    last_message_sender_id: number | null;
    last_message_created_at: Date | null;
    is_hidden: boolean;
    is_blocked: boolean;
    is_blocked_by_partner: boolean;
    partner_id: number;
    partner_name: string;
    partner_avatar: string | null;
  }): ConversationListItemView {
    return {
      conversationId: raw.conversation_id,
      lastMessageAt: raw.last_message_at,
      createdAt: raw.created_at,
      unreadCount: raw.unread_count,
      isHidden: raw.is_hidden,
      isBlocked: raw.is_blocked,
      isBlockedByPartner: raw.is_blocked_by_partner,
      lastMessage:
        raw.last_message_content || raw.last_message_has_images
          ? {
              content: raw.last_message_content,
              hasImages: raw.last_message_has_images,
              senderId: raw.last_message_sender_id!,
              createdAt: raw.last_message_created_at!,
            }
          : null,
      partner: {
        id: raw.partner_id,
        name: raw.partner_name,
        avatarUrl: raw.partner_avatar,
      },
    };
  }

  static toParticipantStatusView(
    raw: ConversationParticipantEntity,
  ): ParticipantStatusView {
    return {
      userId: raw.user_id,
      conversationId: raw.conversation_id,
      isHidden: raw.is_hidden,
      isBlocked: raw.is_blocked,
      lastReadMessageId: raw.last_read_message_id,
    };
  }
}

import { ConversationListItemView, MessageView, ParticipantStatusView } from "../types";
import { ConversationParticipantEntity, MessageEntity } from "./chat.entity";

export class ChatMapper {
    static toMessageView(
        raw: MessageEntity,
        requesterId: number,
    ): MessageView {
        return {
            messageId: raw.message_id,
            conversationId: raw.conversation_id,
            senderId: raw.sender_id,
            content: raw.content,
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
        last_message_sender_id: number | null;
        last_message_created_at: Date | null;
        partner_id: number;
        partner_name: string;
        partner_avatar: string | null;
    }): ConversationListItemView {
        return {
            conversationId: raw.conversation_id,
            lastMessageAt: raw.last_message_at,
            createdAt: raw.created_at,
            unreadCount: raw.unread_count,
            lastMessage: raw.last_message_content
                ? {
                    content: raw.last_message_content,
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

    static toParticipantStatusView(raw: ConversationParticipantEntity): ParticipantStatusView {
        return {
            userId: raw.user_id,
            conversationId: raw.conversation_id,
            isHidden: raw.is_hidden,
            isBlocked: raw.is_blocked,
            lastReadMessageId: raw.last_read_message_id,
        };
    }
}
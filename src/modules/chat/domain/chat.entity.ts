import { InferSelectModel } from 'drizzle-orm';
import { conversations, conversation_participants, messages } from 'src/database/schema';

export type ConversationEntity = InferSelectModel<typeof conversations>;
export type ConversationParticipantEntity = InferSelectModel<typeof conversation_participants>;
export type MessageEntity = InferSelectModel<typeof messages>;
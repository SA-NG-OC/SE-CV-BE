import { InferSelectModel } from "drizzle-orm";
import { job_invitations } from "src/database/schema";

export type JobInvitationEntity = InferSelectModel<typeof job_invitations>;
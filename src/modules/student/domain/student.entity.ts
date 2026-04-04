import { InferSelectModel } from "drizzle-orm";
import { students } from "src/database/schema";

export type StudentEntity = InferSelectModel<typeof students>;
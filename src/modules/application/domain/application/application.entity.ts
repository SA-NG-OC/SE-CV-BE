import { InferSelectModel } from "drizzle-orm";
import { applications } from "src/database/schema";

export type ApplicationEntity = InferSelectModel<typeof applications>;
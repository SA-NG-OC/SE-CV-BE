import { InferSelectModel } from "drizzle-orm";
import { companies } from "src/database/schema";

export type CompanyEntity = InferSelectModel<typeof companies>;
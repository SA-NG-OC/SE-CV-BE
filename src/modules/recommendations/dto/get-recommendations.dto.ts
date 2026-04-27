import { createZodDto } from "nestjs-zod";
import z from "zod";

// =====================
// Get Job Recommendations
// =====================
export const GetJobRecommendationsSchema = z.object({
    //studentId: z.coerce.number().int(),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(50)
        .optional()
        .default(10),

    // weight cho rule-based
    alpha: z.coerce
        .number()
        .min(0)
        .max(1)
        .optional()
        .default(0.6),
});

export class GetJobRecommendationsDto extends createZodDto(
    GetJobRecommendationsSchema
) { }


// =====================
// Get Student Recommendations
// =====================
export const GetStudentRecommendationsSchema = z.object({
    jobId: z.coerce.number().int(),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(50)
        .optional()
        .default(10),

    alpha: z.coerce
        .number()
        .min(0)
        .max(1)
        .optional()
        .default(0.6),
});

export class GetStudentRecommendationsDto extends createZodDto(
    GetStudentRecommendationsSchema
) { }
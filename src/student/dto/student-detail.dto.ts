import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const studentDetailSchema = z.object({
    studentId: z.number(),
    fullName: z.string(),
    studentCode: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    createdAt: z.date().nullable(),
    studentStatus: z.enum(["STUDYING", "GRADUATED", "DROPPED_OUT"]),
    currentYear: z.number().nullable(),
    enrollmentYear: z.number().nullable(),
    majorName: z.string().nullable(),
    gpa: z.number().nullable(),
    isOpenToWork: z.boolean().nullable(),

    skills: z.array(z.string()),

    resumes: z.array(
        z.object({
            resumeId: z.number(),
            resumeName: z.string(),
            cvUrl: z.string(),
            isDefault: z.boolean().nullable(),
        })
    ),

    applicationStats: z.object({
        totalApplications: z.number(),
    }).optional(),
});

export class StudentDetailDto extends createZodDto(studentDetailSchema) { }
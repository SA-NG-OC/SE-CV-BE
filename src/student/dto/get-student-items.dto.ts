import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const studentStatusEnum = z.enum([
    "STUDYING",
    "GRADUATED",
    "DROPPED_OUT",
]);

export const studentItemSchema = z.object({
    studentId: z.number(),

    fullName: z
        .string()
        .min(1, "Tên không được để trống"),

    studentCode: z
        .string()
        .min(1, "MSSV không hợp lệ"),

    email: z
        .string()
        .email("Email không hợp lệ")
        .nullable(),

    enrollmentYear: z
        .number()
        .int()
        .nullable(),

    currentYear: z
        .number()
        .int()
        .min(1)
        .max(10)
        .nullable(),

    studentStatus: studentStatusEnum,

    totalApplications: z
        .number()
        .int()
        .min(0),
});

export class StudentItemDto extends createZodDto(studentItemSchema) { }

export const studentListSchema = z.object({
    data: z.array(studentItemSchema),
    meta: z.object({
        currentPage: z.number(),
        itemsPerPage: z.number(),
        totalItem: z.number(),
        totalPages: z.number(),
    }),
});

export class StudentListDto extends createZodDto(studentListSchema) { }
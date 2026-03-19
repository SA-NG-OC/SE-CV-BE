import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const updateCompanyDetailSchema = z.object({
    industry: z
        .string({ message: "Ngành nghề phải là chuỗi ký tự" })
        .max(100)
        .openapi({ example: "Công nghệ thông tin" }),

    company_size: z
        .string({ message: "Quy mô phải là chuỗi ký tự" })
        .max(50)
        .openapi({ example: "1000+ nhân viên" }),

    address: z
        .string({ message: "Địa chỉ phải là chuỗi ký tự" })
        .max(255)
        .openapi({
            example: "Khu Công Nghệ Cao, Thủ Đức, TP.HCM",
        }),
});

export class UpdateCompanyDetailDto extends createZodDto(
    updateCompanyDetailSchema,
) { }
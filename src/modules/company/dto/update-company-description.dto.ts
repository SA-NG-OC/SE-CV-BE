import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const updateCompanyDescriptionSchema = z.object({
    description: z
        .string({ message: "Mô tả phải là chuỗi ký tự" })
        .max(500, { message: "Mô tả không được vượt quá 500 ký tự" })
        .openapi({
            example: "Chúng tôi chuyên cung cấp giải pháp phần mềm doanh nghiệp.",
        }),
});

export class UpdateCompanyDescriptionDto extends createZodDto(
    updateCompanyDescriptionSchema,
) { }
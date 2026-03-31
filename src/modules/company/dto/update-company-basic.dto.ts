import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const updateCompanyBasicSchema = z.object({
    company_name: z
        .string({ message: "Tên công ty phải là chuỗi ký tự" })
        .min(1, { message: "Tên công ty không được để trống" })
        .max(255, { message: "Tên công ty không được vượt quá 255 ký tự" })
        .openapi({ example: "FPT Software" }),

    slogan: z
        .string({ message: "Slogan phải là chuỗi ký tự" })
        .max(100, { message: "Slogan không được vượt quá 100 ký tự" })
        .openapi({ example: "Leading Technology Solutions Provider" })
        .optional(),
});

export class UpdateCompanyBasicDto extends createZodDto(updateCompanyBasicSchema) { }
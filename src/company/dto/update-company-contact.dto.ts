import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const updateCompanyContactSchema = z.object({
    website: z
        .url({ message: "Website phải là URL hợp lệ" })
        .max(255)
        .openapi({ example: "https://fpt-software.com" })
        .optional(),

    contact_email: z
        .email({ message: "Email không đúng định dạng" })
        .openapi({ example: "careers@fpt.com" }),

    contact_phone: z
        .string({ message: "Số điện thoại phải là chuỗi" })
        .max(20)
        .openapi({ example: "024-1234-5678" })
        .optional(),
});

export class UpdateCompanyContactDto extends createZodDto(
    updateCompanyContactSchema,
) { }
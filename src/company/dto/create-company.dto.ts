import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const createCompanySchema = z.object({
    company_name: z
        .string({ message: "Tên công ty phải là chuỗi ký tự" })
        .min(1, { message: "Tên công ty không được để trống" })
        .max(255, { message: "Tên công ty không được vượt quá 255 ký tự" })
        .openapi({ example: "Công ty TNHH ABC" }),

    industry: z
        .string({ message: "Ngành nghề phải là chuỗi ký tự" })
        .max(100, { message: "Ngành nghề không được vượt quá 100 ký tự" })
        .openapi({ example: "Công nghệ thông tin" })
        .optional(),

    slogan: z
        .string({ message: "Slogan phải là chuỗi ký tự" })
        .max(100, { message: "Slogan không được vượt quá 100 ký tự" })
        .openapi({ example: "Vì một tương lại tương sáng" })
        .optional(),

    company_size: z
        .string({ message: "Quy mô công ty phải là chuỗi ký tự" })
        .max(50, { message: "Quy mô công ty không được vượt quá 50 ký tự" })
        .openapi({ example: "50-100 nhân viên" })
        .optional(),

    website: z
        .url({ message: "Website phải là URL hợp lệ (ví dụ: https://example.com)" })
        .max(255, { message: "Website không được vượt quá 255 ký tự" })
        .openapi({ example: "https://abc.com.vn" })
        .optional(),

    description: z
        .string({ message: "Mô tả phải là chuỗi ký tự" })
        .openapi({ example: "Chúng tôi chuyên cung cấp giải pháp phần mềm doanh nghiệp." })
        .optional(),

    address: z
        .string({ message: "Địa chỉ phải là chuỗi ký tự" })
        .openapi({ example: "123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh" })
        .optional(),

    contact_email: z
        .email({ message: "Email liên hệ không đúng định dạng" })
        .openapi({ example: "contact@abc.com.vn" })
        .optional(),

    contact_phone: z
        .string({ message: "Số điện thoại phải là chuỗi ký tự" })
        .max(20, { message: "Số điện thoại không được vượt quá 20 ký tự" })
        .openapi({ example: "0901234567" })
        .optional(),
});

export class CreateCompanyDto extends createZodDto(createCompanySchema) { }
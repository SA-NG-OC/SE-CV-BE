import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { createZodDto } from 'nestjs-zod';

extendZodWithOpenApi(z);

export const companyCardUserSchema = z.object({
    company_id: z.number().openapi({ example: 1 }),
    company_name: z.string().openapi({ example: 'VNG Corporation' }),
    logo_url: z.string().nullable().openapi({ example: 'https://cloudinary.com/vng-logo.png' }),
    industry: z.string().nullable().openapi({ example: 'Công nghệ - Giải trí' }),

    // Thống kê quan trọng nhất cho User
    active_jobs: z.number().openapi({
        example: 32,
        description: 'Số lượng công việc ĐANG TUYỂN của công ty này'
    }),
});

// DTO cho Response trả về danh sách phân trang
export const companyCardUserPaginatedSchema = z.object({
    data: z.array(companyCardUserSchema),
    meta: z.object({
        currentPage: z.number().openapi({ example: 1 }),
        itemsPerPage: z.number().openapi({ example: 10 }),
        totalItems: z.number().openapi({ example: 50 }),
        totalPages: z.number().openapi({ example: 5 }),
    })
});

export class CompanyCardUserResponseDto extends createZodDto(companyCardUserPaginatedSchema) { }
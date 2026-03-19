import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { createZodDto } from 'nestjs-zod';

extendZodWithOpenApi(z);

export const companyImageSchema = z.object({
    image_id: z.number().openapi({ example: 1 }),
    company_id: z.number().openapi({ example: 1 }),
    image_url: z.string().openapi({ example: 'https://cloudinary.com/office1.png' }),
});

export const companyResponseSchema = z.object({
    // ── Định danh ──────────────────────────────────────────────
    company_id: z.number().openapi({ example: 1 }),
    user_id: z.number().openapi({ example: 42 }),

    // ── Thông tin cơ bản ───────────────────────────────────────
    company_name: z.string().openapi({ example: 'Công ty ABC' }),
    slogan: z.string().nullable().openapi({ example: 'Vì một tương lai tương sáng' }),
    company_size: z.string().nullable().openapi({ example: '50-100' }),
    website: z.string().nullable().openapi({ example: 'https://abc.com' }),
    description: z.string().nullable().openapi({ example: 'Mô tả công ty' }),

    // ── Địa chỉ ────────────────────────────────────────────────
    address: z.string().nullable().openapi({ example: '123 Nguyễn Huệ' }),

    // ── Liên hệ ────────────────────────────────────────────────
    contact_email: z.string().nullable().openapi({ example: 'contact@abc.com' }),
    contact_phone: z.string().nullable().openapi({ example: '0123456789' }),

    // ── Hình ảnh ───────────────────────────────────────────────
    logo_url: z.string().nullable().openapi({ example: 'https://cloudinary.com/logo.png' }),
    cover_image_url: z.string().nullable().openapi({ example: 'https://cloudinary.com/cover.png' }),

    // ── Trạng thái & thống kê ──────────────────────────────────
    // Drizzle mặc định có thể trả về null nếu không có ràng buộc .notNull()
    is_verified: z.boolean().nullable().openapi({
        example: false,
        description: 'Công ty đã được admin xác minh chưa',
    }),

    // Rating thường là string (Decimal) trong Postgres
    rating: z.string().nullable().openapi({
        example: '4.5',
        description: 'Điểm đánh giá trung bình',
    }),

    total_jobs_posted: z.number().nullable().openapi({
        example: 20,
        description: 'Tổng số job đã đăng',
    }),

    total_followers: z.number().nullable().openapi({
        example: 120,
        description: 'Số người đang theo dõi công ty',
    }),

    status: z.string().nullable().openapi({
        example: 'PENDING',
        description: 'Trạng thái của công ty',
    }),

    // ── Timestamps (Sửa lỗi chính tại đây) ──────────────────────
    // Drizzle trả về Date object, Zod cần hiểu cả Date và String (khi serialize)
    created_at: z.union([z.date(), z.string()]).nullable().openapi({
        type: 'string',
        format: 'date-time'
    }),

    updated_at: z.union([z.date(), z.string()]).nullable().openapi({
        type: 'string',
        format: 'date-time'
    }),

    office_images: z.array(companyImageSchema).openapi({
        description: 'Danh sách ảnh văn phòng',
    }),
});

export class CompanyResponseDto extends createZodDto(companyResponseSchema) { }
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const GetInvitationsQuerySchema = z.object({
    status: z
        .enum(['pending', 'accepted', 'rejected', 'expired'], {
            message: 'Trạng thái không hợp lệ',
        })
        .optional(),

    search: z.string().trim().optional(),

    categoryId: z.coerce.number().int().optional(),

    dateRange: z.enum(['7days', '30days']).optional(),

    // Số trang hiện tại - Mặc định là 1
    page: z.coerce
        .number()
        .int()
        .positive('Số trang phải lớn hơn 0')
        .default(1),

    // Số bản ghi mỗi trang - Mặc định là 10
    limit: z.coerce
        .number()
        .int()
        .positive('Số lượng bản ghi phải lớn hơn 0')
        .max(100, 'Không thể lấy quá 100 bản ghi một lần')
        .default(10),
});

export class GetInvitationsQueryDto extends createZodDto(GetInvitationsQuerySchema) { }
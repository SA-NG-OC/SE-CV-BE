import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiParam, ApiBody } from '@nestjs/swagger';

export const ChangeJobStatusDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Cập nhật trạng thái tin tuyển dụng (Admin)',
        description: `
            Admin duyệt, từ chối hoặc hạn chế tin tuyển dụng. Yêu cầu role ADMIN.
            
            **Các trạng thái hợp lệ (status):**
            - \`pending\`: Chờ duyệt
            - \`approved\`: Đã duyệt (hiển thị lên hệ thống)
            - \`rejected\`: Từ chối (không hợp lệ)
            - \`restricted\`: Bị hạn chế (vi phạm điều khoản)
            
            *Lưu ý: Chỉ khi chọn **rejected** hoặc **restricted** mới nên điền **admin_note**.*
        `,
    }),
    ApiParam({ name: 'id', type: Number, description: 'ID của tin tuyển dụng', example: 42 }),
    ApiBody({
        schema: {
            type: 'object',
            required: ['status'],
            properties: {
                status: {
                    type: 'string',
                    enum: ['pending', 'approved', 'rejected', 'restricted'],
                    example: 'rejected',
                },
                admin_note: {
                    type: 'string',
                    maxLength: 500,
                    nullable: true,
                    example: 'Tin đăng đã đầy đủ thông tin và hợp lệ.',
                    description: 'Ghi chú của admin (khuyến nghị điền khi rejected hoặc restricted)',
                },
            },
        },
    }),
    ApiOkResponse({
        description: 'Cập nhật trạng thái thành công',
        example: {
            success: true,
            message: "Cập nhật trạng thái bài đăng thành công",
            data: 7
        },
    }),
);
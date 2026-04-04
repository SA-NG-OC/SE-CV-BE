import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiParam, ApiBody } from '@nestjs/swagger';

export const UpdateCompanyStatusDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Cập nhật trạng thái công ty (Admin)',
        description: 'Admin duyệt, từ chối hoặc hạn chế công ty. Yêu cầu role ADMIN. Khi từ chối có thể thêm note đi kèm (Không bắt buộc).',
    }),
    ApiParam({
        name: 'id',
        type: Number,
        description: 'ID của công ty cần cập nhật trạng thái',
        example: 1,
    }),
    ApiBody({
        description: 'Trạng thái mới và ghi chú của admin',
        schema: {
            type: 'object',
            required: ['status'],
            properties: {
                status: {
                    type: 'string',
                    enum: ['APPROVED', 'REJECTED', 'RESTRICTED'],
                    example: 'APPROVED',
                },
                admin_note: {
                    type: 'string',
                    example: 'Công ty đã cung cấp đầy đủ thông tin.',
                    description: 'Ghi chú của admin (bắt buộc khi REJECTED hoặc RESTRICTED)',
                },
            },
        },
    }),
    ApiOkResponse({
        description: 'Cập nhật trạng thái thành công',
        example: {
            success: true,
            message: 'Cập nhật thành công',
            data: {},
        },
    }),
);
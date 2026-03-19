// decorators/change-company-status.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CompanyDataResponse } from './company-swagger.response';

const ChangeCompanyStatusDocs = () =>
    applyDecorators(
        ApiBearerAuth('access-token'),
        ApiOperation({
            summary: '[Admin] Thay đổi trạng thái công ty',
            description:
                'Yêu cầu role **ADMIN**. ' +
                'Nếu `status` là `APPROVED` hoặc `PENDING`, trường `admin_note` sẽ tự động bị set về `null`.',
        }),
        ApiParam({ name: 'id', type: Number, description: 'ID của công ty' }),
        ApiBody({
            schema: {
                type: 'object',
                required: ['status'],
                properties: {
                    status: {
                        type: 'string',
                        enum: ['PENDING', 'APPROVED', 'REJECTED', 'RESTRICTED'],
                        example: 'REJECTED',
                        description: 'Trạng thái mới của công ty',
                    },
                    admin_note: {
                        type: 'string',
                        nullable: true,
                        example: 'Hồ sơ chưa đầy đủ, vui lòng bổ sung giấy phép kinh doanh.',
                        description:
                            'Lý do từ chối / hạn chế. ' +
                            'Có thể điền khi status là REJECTED hoặc RESTRICTED. ' +
                            'Tự động bị xóa khi status là APPROVED hoặc PENDING.',
                    },
                },
            },
        }),
        ApiOkResponse({
            description: 'Cập nhật trạng thái thành công.', example: {
                success: true,
                message: "Cập nhật thành công",
                data: {
                    company_id: 5,
                    user_id: 11,
                    company_name: "TechNova Solutions",
                    industry: "Information Technology",
                    slogan: null,
                    company_size: "50-100",
                    website: "https://technova.vn",
                    logo_url: "https://res.cloudinary.com/deagejli9/image/upload/v1773903845/nest_uploads/gbs4huatnqxg6dbdbnos.png",
                    cover_image_url: "https://res.cloudinary.com/deagejli9/image/upload/v1773903846/nest_uploads/unclrbk3mqpj64lklqok.png",
                    description: "Công ty chuyên phát triển phần mềm và giải pháp AI",
                    address: "Ho Chi Minh City",
                    city: null,
                    district: null,
                    contact_email: null,
                    contact_phone: null,
                    is_verified: false,
                    status: "APPROVED",
                    admin_note: null,
                    rating: "0.0",
                    total_jobs_posted: 0,
                    total_followers: 0,
                    created_at: "2026-03-19T14:04:11.030Z",
                    updated_at: "2026-03-19T14:04:11.030Z"
                }
            }
        }),
    );

export default ChangeCompanyStatusDocs;
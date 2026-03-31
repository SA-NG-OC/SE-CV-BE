// decorators/create-company.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { CompanyDataResponse } from './company-swagger.response';

const CreateCompanyDocs = () =>
    applyDecorators(
        ApiBearerAuth('access-token'),
        ApiConsumes('multipart/form-data'),
        ApiOperation({
            summary: 'Tạo mới công ty',
            description: 'Yêu cầu role **COMPANY**. Upload logo, ảnh bìa và tối đa 6 ảnh văn phòng kèm thông tin công ty.',
        }),
        ApiBody({
            schema: {
                type: 'object',
                properties: {
                    logo: { type: 'file', format: 'binary', description: 'Logo công ty' },
                    coverImage: { type: 'file', format: 'binary', description: 'Ảnh bìa công ty' },
                    officeImages: {
                        type: 'array',
                        items: { type: 'file', format: 'binary' },
                        description: 'Tối đa 6 ảnh văn phòng',
                    },
                    company_name: { type: 'string', example: 'Công ty TNHH ABC' },
                    industry: { type: 'string', example: 'Chúa hề' },
                    slogan: { type: 'string', example: 'Vì một tương lai tươi sáng' },
                    website: { type: 'string', example: 'https://abc.com' },
                    company_size: { type: 'string', example: '50-100' },
                    description: { type: 'string', example: 'Mô tả công ty...' },
                    address: { type: 'string', example: '123 Nguyễn Huệ' },
                    contact_email: { type: 'string', example: 'contact@abc.com' },
                    contact_phone: { type: 'string', example: '0123456789' },
                },
            },
        }),
        ApiCreatedResponse({
            description: 'Tạo công ty thành công.', example: {
                success: true,
                message: "Tạo mới công ty thành công",
                data: {
                    company_id: 6,
                    user_id: 2,
                    company_name: "TechNova Solutions",
                    industry: "Information Technology",
                    slogan: null,
                    company_size: "50-100",
                    website: "https://technova.vn",
                    logo_url: "https://res.cloudinary.com/deagejli9/image/upload/v1773905800/nest_uploads/hwrcgtxzcozigek0fajv.png",
                    cover_image_url: "https://res.cloudinary.com/deagejli9/image/upload/v1773905801/nest_uploads/asocsmzsaetftw8zidrs.png",
                    description: "Công ty chuyên phát triển phần mềm và giải pháp AI",
                    address: "Ho Chi Minh City",
                    city: null,
                    district: null,
                    contact_email: null,
                    contact_phone: null,
                    is_verified: false,
                    status: "PENDING",
                    admin_note: null,
                    rating: "0.0",
                    total_jobs_posted: 0,
                    total_followers: 0,
                    created_at: "2026-03-19T14:36:46.302Z",
                    updated_at: "2026-03-19T14:36:46.302Z"
                }
            }
        }),
    );

export default CreateCompanyDocs;
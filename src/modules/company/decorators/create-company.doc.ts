import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiConsumes, ApiTags, ApiBadRequestResponse, ApiBody } from '@nestjs/swagger';

export const CreateCompanyDocs = () => applyDecorators(
    ApiTags('Company'),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Tạo mới công ty' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
        schema: {
            type: 'object',
            required: ['company_name', 'email', 'phone_number'], // Các trường bắt buộc
            properties: {
                company_name: { type: 'string', example: 'Công ty Công nghệ ABC' },
                industry: { type: 'string', example: 'IT' },
                slogan: { type: 'string', example: 'Vì một tương lai tương sáng' },
                company_size: { type: 'string', example: '100-200' },
                website: { type: 'string', example: 'hr@abc.com' },
                description: { type: 'string', example: 'hr@abc.com' },
                address: { type: 'string', example: 'hr@abc.com' },
                contact_email: { type: 'string', example: 'hr@abc.com' },
                contact_phone: { type: 'string', example: '0901234567' },
                // Định nghĩa các trường File
                logo: { type: 'string', format: 'binary' },
                coverImage: { type: 'file', format: 'binary' },
                officeImages: { type: 'file[]', items: { type: 'string', format: 'binary' } },
            },
        },
    }),
    ApiOkResponse({
        example: {
            success: true,
            message: "Tạo mới công ty thành công",
            data: {
                companyId: 7,
                userId: 2000,
                companyName: "TechNova Solutions",
                industry: "Information Technology",
                slogan: null,
                companySize: "50-100",
                website: "https://technova.vn",
                logoUrl: "https://res.cloudinary.com/deagejli9/image/upload/v1775297599/nest_uploads/lfhhh3dlsvqatwmyibt5.png",
                coverImageUrl: "https://res.cloudinary.com/deagejli9/image/upload/v1775297600/nest_uploads/eklwyouij2ya5ssi8zzy.png",
                description: "Công ty chuyên phát triển phần mềm và giải pháp AI",
                address: "Ho Chi Minh City",
                contactEmail: null,
                contactPhone: null,
                status: "PENDING",
                adminNote: null,
                rating: 0,
                totalJobsPosted: 0,
                totalFollowers: 0,
                createdAt: "2026-04-04T10:13:24.754Z",
                updatedAt: "2026-04-04T10:13:24.754Z",
                officeImages: [
                    {
                        imageId: 9,
                        companyId: 7,
                        imageUrl: "https://res.cloudinary.com/deagejli9/image/upload/v1775297601/nest_uploads/zguyphl8y7xvuu951wuq.png",
                        createdAt: "2026-04-04T10:13:24.037Z"
                    }
                ]
            }
        }
    }),
    ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
);
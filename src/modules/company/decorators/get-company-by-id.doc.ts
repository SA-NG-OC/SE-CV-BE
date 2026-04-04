import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiParam } from '@nestjs/swagger';

export const GetCompanyByIdDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Lấy thông tin công ty theo ID',
        description: 'Yêu cầu role ADMIN hoặc STUDENT. Admin có thể xem tất cả trạng thái, Student chỉ xem công ty đã APPROVED.',
    }),
    ApiParam({
        name: 'companyId',
        type: Number,
        description: 'ID của công ty',
        example: 1,
    }),
    ApiOkResponse({
        description: 'Lấy thông tin công ty thành công',
        example: {
            success: true,
            message: "Lấy thông tin công ty thành công",
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
        },
    }),
);
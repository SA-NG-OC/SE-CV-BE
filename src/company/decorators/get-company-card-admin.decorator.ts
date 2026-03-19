// decorators/get-company-card-admin.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PaginatedCompanyDataResponse } from './company-swagger.response';

const GetCompanyCardAdminDocs = () =>
    applyDecorators(
        ApiBearerAuth('access-token'),
        ApiOperation({
            summary: '[Admin] Lấy danh sách công ty',
            description: 'Yêu cầu role **ADMIN**. Hỗ trợ lọc theo `status` và phân trang.',
        }),
        ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
        ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
        ApiQuery({
            name: 'status',
            required: false,
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'RESTRICTED'],
            description: 'Lọc theo trạng thái công ty. Bỏ trống để lấy tất cả.',
        }),
        ApiOkResponse({
            description: 'Lấy danh sách công ty thành công.', example: {
                success: true,
                message: "Lấy thông tin thành công",
                data: {
                    data: [
                        {
                            companyId: 4,
                            companyName: "FPT Software",
                            logoUrl: "https://res.cloudinary.com/deagejli9/image/upload/v1773896630/nest_uploads/t1rlqplxxkxplnwoc8fr.png",
                            industry: "Công nghệ thông tin",
                            status: "PENDING",
                            rating: "0.0",
                            followers: 0,
                            totalJobs: 0,
                            companySize: "1000+ nhân viên",
                            createdAt: "2026-03-17T10:21:26.557Z"
                        }
                    ],
                    status: [
                        {
                            status: "PENDING",
                            count: 1
                        }
                    ],
                    meta: {
                        currentPage: 1,
                        itemsPerPage: 10,
                        totalPages: 1
                    }
                }
            }
        }),
    );

export default GetCompanyCardAdminDocs;
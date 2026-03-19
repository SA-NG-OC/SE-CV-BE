// decorators/get-company-cards-for-user.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PaginatedCompanyDataResponse } from './company-swagger.response';

const GetCompanyCardsForUserDocs = () =>
    applyDecorators(
        ApiBearerAuth('access-token'),
        ApiOperation({
            summary: 'Lấy danh sách công ty (dành cho sinh viên)',
            description: 'Yêu cầu role **STUDENT**. Chỉ trả về các công ty có trạng thái `APPROVED`.',
        }),
        ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
        ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
        ApiOkResponse({
            description: 'Lấy danh sách công ty thành công.', example: {
                success: true,
                message: "Lấy danh sách công ty thành công",
                data: {
                    data: [
                        {
                            company_id: 4,
                            company_name: "FPT Software",
                            logo_url: "https://res.cloudinary.com/deagejli9/image/upload/v1773896630/nest_uploads/t1rlqplxxkxplnwoc8fr.png",
                            industry: "Công nghệ thông tin",
                            active_jobs: 0
                        }
                    ],
                    meta: {
                        currentPage: 1,
                        itemsPerPage: 10,
                        totalItems: 1,
                        totalPages: 1
                    }
                }
            }
        }),
    );

export default GetCompanyCardsForUserDocs;
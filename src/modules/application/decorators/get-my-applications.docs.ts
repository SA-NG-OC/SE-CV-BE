import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

export const GetMyApplicationsDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Danh sách đơn ứng tuyển của tôi',
        description: 'Lấy danh sách các công việc sinh viên đã ứng tuyển. Yêu cầu role STUDENT.',
    }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'status', required: false, enum: ['submitted', 'interviewing', 'passed', 'rejected'] }),
    ApiResponse({
        status: 200, description: 'Lấy thông tin thành công', example: {
            success: true,
            message: "Lấy thông tin thành công",
            data: {
                data: [
                    {
                        applicationId: 3,
                        status: "submitted",
                        createdAt: "2026-04-09T01:45:25.096Z",
                        job: {
                            jobId: 7,
                            jobTitle: "Hahahahahahahahahaha"
                        },
                        company: {
                            companyId: 3,
                            companyName: "TechNova Solutions",
                            logoUrl: "https://res.cloudinary.com/deagejli9/image/upload/v1775297599/nest_uploads/lfhhh3dlsvqatwmyibt5.png"
                        }
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
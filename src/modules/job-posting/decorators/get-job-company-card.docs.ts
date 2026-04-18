import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiQuery, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';

export const GetJobCardCompanyDocs = () => applyDecorators(
    ApiOperation({
        summary: 'Lấy danh sách tin tuyển dụng của công ty (dạng card)',
        description: 'Trả về danh sách tin tuyển dụng có phân trang và bộ lọc (search, tag, city). Yêu cầu quyền Company và JWT token.',
    }),
    ApiBearerAuth(),
    // Query Params dựa trên JobPostingFilterSchema
    ApiQuery({
        name: 'page',
        type: Number,
        required: false,
        description: 'Số trang hiện tại (mặc định là 1)',
    }),
    ApiQuery({
        name: 'limit',
        type: Number,
        required: false,
        description: 'Số lượng bản ghi trên mỗi trang (tối đa 50, mặc định là 10)',
    }),
    ApiQuery({
        name: 'search',
        type: String,
        required: false,
        description: 'Tìm kiếm theo tiêu đề công việc',
    }),
    ApiQuery({
        name: 'tag',
        required: false,
        enum: ['Pending', 'Hidden', 'Closed', 'Active'],
        description: 'Lọc theo trạng thái của tin tuyển dụng',
    }),
    ApiQuery({
        name: 'city',
        type: String,
        required: false,
        description: 'Lọc theo thành phố',
    }),
    ApiOkResponse({
        description: 'Lấy thông tin thành công',
        example: {
            success: true,
            message: "Lấy thông tin thành công",
            data: {
                data: [
                    {
                        jobId: 9,
                        jobTitle: "Frontend Developer Intern 2.0",
                        city: "Hà Tĩnh",
                        companyName: "TechNova Solutions",
                        logoUrl: "https://res.cloudinary.com/deagejli9/image/upload/v1775297599/nest_uploads/lfhhh3dlsvqatwmyibt5.png",
                        salaryMin: 3000000,
                        salaryMax: 5000000,
                        salaryType: "RANGE",
                        isSalaryNegotiable: false,
                        applicationDeadline: "2026-08-01",
                        status: "approved",
                        tag: "Hidden",
                        applicantCount: 0,
                        skills: [
                            { skillId: 1, skillName: "React" },
                            { skillId: 2, skillName: "Node.js" },
                            { skillId: 3, skillName: "TypeScript" }
                        ],
                        createdAt: "2026-04-18T10:49:22.321Z"
                    }
                ],
                meta: {
                    currentPage: 1,
                    itemsPerPage: 10,
                    totalItems: 1,
                    totalPages: 1
                }
            }
        },
    }),
);
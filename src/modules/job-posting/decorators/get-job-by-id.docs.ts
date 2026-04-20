import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiParam } from '@nestjs/swagger';

export const GetJobByIdDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Lấy chi tiết tin tuyển dụng theo ID',
        description: [
            'Trả về chi tiết một tin tuyển dụng.',
            'COMPANY chỉ xem được tin của công ty mình.',
            'ADMIN xem được tất cả.',
            'STUDENT chỉ xem được những tin tuyển dụng approved'
        ].join(' '),
    }),
    ApiParam({ name: 'id', type: Number, description: 'ID của tin tuyển dụng', example: 42 }),
    ApiOkResponse({
        description: 'Lấy thông tin thành công',
        example: {
            success: true,
            message: "Lấy thông tin thành công",
            data: {
                jobId: 8,
                companyId: 7,
                categoryId: 1,
                logoUrl: "https://res.cloudinary.com/deagejli9/image/upload/v1775297599/nest_uploads/lfhhh3dlsvqatwmyibt5.png",
                jobTitle: "Frontend Developer Intern 3.0",
                jobDescription: "Chúng tôi tìm kiếm Frontend Developer Intern nhiệt huyết, có khả năng xây dựng giao diện web hiện đại với ReactJS. Bạn sẽ làm việc trực tiếp cùng team sản phẩm, tham gia vào các dự án thực tế và được mentor bởi senior engineer.",
                requirements: "Có kiến thức cơ bản về HTML 5, CSS, JavaScript\nBiết ReactJS hoặc đang học\nCó thể đi làm ít nhất 40 buổi/tuần",
                benefits: "Lương thực tập cạnh tranh\nĐược mentor 1-1 bởi senior\nMôi trường trẻ, năng động\nXét chuyển full-time sau 3 tháng",
                experienceLevel: "FRESHER",
                positionLevel: "STAFF",
                numberOfPositions: 3,
                salaryMin: 3000000,
                salaryMax: 3000000,
                salaryType: "RANGE",
                isSalaryNegotiable: false,
                city: "HCM",
                applicationDeadline: "2026-07-01",
                isActive: true,
                status: "pending",
                applicantCount: 0,
                createdAt: "2026-04-06T02:05:19.350Z",
                updatedAt: "2026-04-06T02:06:30.385Z",
                adminNote: "Tin tuyển dụng chứa nội dung lừa đảo",
                requiredSkills: [
                    { skillId: 1, skillName: "React" },
                    { skillId: 2, skillName: "Node.js" },
                    { skillId: 3, skillName: "TypeScript" }
                ]
            }
        },
    }),
);
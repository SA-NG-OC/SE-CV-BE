import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

export const GetApplicantsDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Danh sách ứng viên (Company)',
        description: 'Lấy danh sách sinh viên đã ứng tuyển. Yêu cầu role COMPANY.',
    }),
    ApiQuery({ name: 'jobId', required: false, type: Number }),
    ApiQuery({ name: 'status', required: false }),
    ApiQuery({ name: 'dateRange', required: false, enum: ['7days', '30days'] }),
    ApiQuery({ name: 'page', required: false, type: Number, default: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, default: 10 }),
    ApiResponse({
        status: 200, description: 'Lấy thông tin thành công', example: {
            success: true,
            message: "Lấy thông tin thành công",
            data: {
                data: [
                    {
                        applicationId: 3,
                        status: "submitted",
                        cvUrl: "https://example.com/cv.pdf",
                        createdAt: "2026-04-09T01:45:25.096Z",
                        updatedAt: "2026-04-27T01:56:12.858Z",
                        student: {
                            studentId: 100,
                            fullName: "Nguyễn Văn A",
                            email: "nguyenvana@student.edu.vn",
                            avatarUrl: null,
                            currentYear: 4,
                            majorName: "Công nghệ thông tin",
                            gpa: "3.45",
                            phone: "0912345678",
                            skills: [
                                {
                                    skillId: 1,
                                    skillName: "React"
                                },
                                {
                                    skillId: 2,
                                    skillName: "Node.js"
                                },
                                {
                                    skillId: 3,
                                    skillName: "TypeScript"
                                }
                            ]
                        },
                        job: {
                            jobId: 7,
                            jobTitle: "Hahahahahahahahahaha"
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
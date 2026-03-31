// decorators/get-student-profile.decorator.ts
import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiParam } from '@nestjs/swagger';

const GetStudentProfileDocs = () => applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiBearerAuth('access-token'),
    ApiOperation({
        summary: 'Lấy thông tin chi tiết của một sinh viên',
        description: 'Yêu cầu `Bearer Token`. Dành cho quyền `ADMIN` hoặc `COMPANY` (để nhà tuyển dụng xem hồ sơ ứng viên).',
    }),
    ApiParam({ name: 'id', required: true, type: Number, description: 'ID của sinh viên cần xem hồ sơ', example: 1 }),
    ApiOkResponse({
        description: 'Lấy thông tin chi tiết thành công.',
        schema: {
            example: {
                success: true,
                message: "Lấy thông tin thành công",
                data: {
                    studentId: 1,
                    fullName: "Phan Ngọc Sơn",
                    studentCode: "23521363",
                    email: "nguyenvana@student.edu.vn",
                    phone: "0912345678",
                    createdAt: "2026-03-22T21:59:45.779Z",
                    studentStatus: "STUDYING",
                    currentYear: 4,
                    enrollmentYear: 2021,
                    gpa: 3.45,
                    isOpenToWork: true,
                    majorName: "Công nghệ thông tin",
                    skills: [
                        "React",
                        "Node.js",
                        "TypeScript"
                    ],
                    resumes: [
                        {
                            resumeId: 1,
                            resumeName: "CV Frontend ReactJS - Tiếng Việt",
                            cvUrl: "https://example.com/cv_frontend.pdf",
                            isDefault: true
                        },
                        {
                            resumeId: 2,
                            resumeName: "CV Backend Node.js - English",
                            cvUrl: "https://example.com/cv_backend.pdf",
                            isDefault: false
                        }
                    ]
                }
            }
        },
    }),
);

export default GetStudentProfileDocs;
import { applyDecorators } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiOkResponse,
    ApiQuery,
} from '@nestjs/swagger';

export const GetStudentRecommendationsDocs = () =>
    applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Lấy danh sách ứng viên phù hợp cho job',
            description: `
        API trả về danh sách sinh viên phù hợp với một job cụ thể.

        Kết quả được tính dựa trên:
        - Skill matching
        - Salary expectation
        - Location matching
        - Vector similarity

        **Yêu cầu role: COMPANY**
      `,
        }),

        ApiQuery({
            name: 'jobId',
            required: true,
            example: 1,
            description: 'ID của job cần tìm ứng viên',
        }),
        ApiQuery({
            name: 'limit',
            required: false,
            example: 10,
        }),
        ApiQuery({
            name: 'alpha',
            required: false,
            example: 0.6,
        }),

        ApiOkResponse({
            description: 'Lấy đề xuất thành công',
            example: {
                success: true,
                message: 'Lấy đề xuất thành công',
                data: [
                    {
                        studentId: 100,
                        fullName: 'Nguyễn Văn A',
                        avatarUrl: null,
                        currentYear: 4,
                        gpa: '3.45',
                        isOpenToWork: true,
                        studentStatus: 'STUDYING',
                        skills: ['React', 'Node.js', 'TypeScript'],
                        ruleScore: 83,
                        vectorScore: 71,
                        finalScore: 79,
                        matchReasons: [
                            {
                                type: 'skillMatch',
                                matched: [{ skillId: 100 }, { skillId: 102 }],
                            },
                            {
                                type: 'salaryMatch',
                                overlapPct: 100,
                            },
                            {
                                type: 'locationMatch',
                            },
                            {
                                type: 'semanticMatch',
                                similarity: 0.71,
                                label: 'Hồ sơ ứng viên rất gần với yêu cầu công việc',
                            },
                        ],
                    },
                ],
            },
        }),
    );
import { applyDecorators } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiOkResponse,
    ApiQuery,
} from '@nestjs/swagger';

export const GetJobRecommendationsDocs = () =>
    applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Lấy danh sách job đề xuất cho sinh viên',
            description: `
        API trả về danh sách công việc phù hợp với sinh viên hiện tại.
        
        Kết quả được tính dựa trên:
        - Rule-based scoring (skill, salary, location, GPA)
        - Vector similarity (embedding)
        - Hybrid scoring (alpha blending)

        **Yêu cầu role: STUDENT**
      `,
        }),

        // Query params
        ApiQuery({
            name: 'limit',
            required: false,
            example: 10,
            description: 'Số lượng kết quả trả về',
        }),
        ApiQuery({
            name: 'alpha',
            required: false,
            example: 0.6,
            description: 'Trọng số giữa rule-based và vector score',
        }),

        ApiOkResponse({
            description: 'Lấy đề xuất thành công',
            example: {
                success: true,
                message: 'Lấy đề xuất thành công',
                data: [
                    {
                        jobId: 100,
                        companyId: 100,
                        companyName: 'Tech Solutions Vietnam',
                        logoUrl: null,
                        jobTitle: 'Frontend Developer (React)',
                        city: 'TP.HCM',
                        salaryMin: 12000000,
                        salaryMax: 20000000,
                        salaryType: 'monthly',
                        isSalaryNegotiable: true,
                        postedAt: 'Hôm nay',
                        skills: [
                            { skillId: 100, skillName: 'React' },
                            { skillId: 102, skillName: 'TypeScript' },
                        ],
                        ruleScore: 83,
                        vectorScore: 71,
                        finalScore: 79,
                        matchReasons: [
                            {
                                type: 'skillMatch',
                                matched: [
                                    { skillId: 100, skillName: 'React' },
                                    { skillId: 102, skillName: 'TypeScript' },
                                ],
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
                                label: 'Phù hợp với định hướng và hồ sơ của bạn',
                            },
                        ],
                    },
                ],
            },
        }),
    );
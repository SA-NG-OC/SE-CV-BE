import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiCreatedResponse, ApiBody } from '@nestjs/swagger';

export const CreateJobPostingDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Tạo tin tuyển dụng',
        description: 'Tạo mới một tin tuyển dụng cho công ty hiện tại. Yêu cầu role COMPANY.',
    }),
    ApiBody({
        schema: {
            type: 'object',
            required: ['jobTitle', 'jobDescription', 'requirements'],
            properties: {
                jobTitle: { type: 'string', minLength: 5, maxLength: 255, example: 'Senior Frontend Developer' },
                categoryId: { type: 'integer', example: 2 },
                city: { type: 'string', maxLength: 100, example: 'Hồ Chí Minh' },
                applicationDeadline: { type: 'string', format: 'date-time', example: '2026-06-30T17:00:00.000Z' },
                salaryMin: { type: 'integer', minimum: 0, example: 15000000 },
                salaryMax: { type: 'integer', minimum: 1, example: 30000000 },
                salaryType: { type: 'string', enum: ['FIXED', 'RANGE', 'NEGOTIABLE'], example: 'RANGE' },
                isSalaryNegotiable: { type: 'boolean', default: true, example: false },
                numberOfPositions: { type: 'integer', minimum: 1, default: 1, example: 3 },
                jobDescription: { type: 'string', minLength: 20, example: 'Mô tả chi tiết công việc...' },
                requirements: { type: 'string', minLength: 10, example: 'Yêu cầu ứng viên có ít nhất 3 năm kinh nghiệm...' },
                benefits: { type: 'string', example: 'Thưởng tháng 13, bảo hiểm sức khỏe...' },
                experienceLevel: { type: 'string', enum: ['FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD', 'MANAGER'], example: 'SENIOR' },
                positionLevel: { type: 'string', enum: ['STAFF', 'TEAM_LEAD', 'SUPERVISOR', 'MANAGER', 'DIRECTOR', 'C_LEVEL'], example: 'STAFF' },
                skillIds: { type: 'array', items: { type: 'integer' }, example: [1, 3, 7] },
                isUrgent: { type: 'boolean', default: false, example: false },
            },
        },
    }),
    ApiCreatedResponse({
        description: 'Tạo tin tuyển dụng thành công',
        example: {
            success: true,
            message: 'Đăng tin tuyển dụng thành công',
            data: { jobId: 42 },
        },
    }),
);
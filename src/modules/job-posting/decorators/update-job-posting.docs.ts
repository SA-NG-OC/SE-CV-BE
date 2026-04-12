import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiParam, ApiBody } from '@nestjs/swagger';

export const UpdateJobPostingDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Cập nhật tin tuyển dụng',
        description: `
            Cập nhật thông tin tin tuyển dụng theo ID. Yêu cầu role **COMPANY** và phải là chủ sở hữu tin.
            
            **Các trường Enum chấp nhận giá trị:**
            - **salaryType**: \`FIXED\`, \`RANGE\`, \`NEGOTIABLE\`
            - **experienceLevel**: \`FRESHER\`, \`JUNIOR\`, \`MIDDLE\`, \`SENIOR\`, \`LEAD\`, \`MANAGER\`
            - **positionLevel**: \`STAFF\`, \`TEAM_LEAD\`, \`SUPERVISOR\`, \`MANAGER\`, \`DIRECTOR\`, \`C_LEVEL\`
            
            *Ghi chú: Nếu truyền **skillIds**, hệ thống sẽ thay thế toàn bộ skills cũ bằng danh sách mới.*
        `,
    }),
    ApiParam({ name: 'id', type: Number, description: 'ID của tin tuyển dụng', example: 42 }),
    ApiBody({
        description: 'Các trường cần cập nhật (tất cả đều optional)',
        schema: {
            type: 'object',
            properties: {
                jobTitle: { type: 'string', minLength: 5, maxLength: 255, example: 'Senior Frontend Developer' },
                categoryId: { type: 'integer', example: 2 },
                city: { type: 'string', maxLength: 100, example: 'Hà Nội' },
                applicationDeadline: { type: 'string', format: 'date-time', example: '2026-07-31T17:00:00.000Z' },
                salaryMin: { type: 'integer', minimum: 0, example: 20000000 },
                salaryMax: { type: 'integer', minimum: 1, example: 40000000 },
                salaryType: { type: 'string', enum: ['FIXED', 'RANGE', 'NEGOTIABLE'], example: 'RANGE' },
                isSalaryNegotiable: { type: 'boolean', example: false },
                numberOfPositions: { type: 'integer', minimum: 1, example: 2 },
                jobDescription: { type: 'string', minLength: 20, example: 'Mô tả công việc đã cập nhật...' },
                requirements: { type: 'string', minLength: 10, example: 'Yêu cầu ứng viên đã cập nhật...' },
                benefits: { type: 'string', example: 'Thưởng KPI, WFH 2 ngày/tuần...' },
                experienceLevel: { type: 'string', enum: ['FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD', 'MANAGER'], example: 'SENIOR' },
                positionLevel: { type: 'string', enum: ['STAFF', 'TEAM_LEAD', 'SUPERVISOR', 'MANAGER', 'DIRECTOR', 'C_LEVEL'], example: 'TEAM_LEAD' },
                skillIds: { type: 'array', items: { type: 'integer' }, example: [1, 5, 9], description: 'Sẽ thay thế toàn bộ skills hiện tại' },
                isUrgent: { type: 'boolean', example: true },
            },
        },
    }),
    ApiOkResponse({
        description: 'Cập nhật tin tuyển dụng thành công',
        example: {
            success: true,
            message: "Cập nhật thông tin tuyển dụng thành công",
            data: {
                jobId: 8,
                jobTitle: "Frontend Developer Intern 3.0"
            }
        },
    }),
);
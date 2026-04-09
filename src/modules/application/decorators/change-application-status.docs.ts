import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

export const ChangeApplicationStatusDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Thay đổi trạng thái đơn ứng tuyển',
        description: 'Chuyển trạng thái đơn sang phỏng vấn, đạt hoặc loại. Yêu cầu role COMPANY. status truyền vào là interviewing, passed hoặc rejected',
    }),
    ApiParam({ name: 'id', type: Number }),
    ApiBody({
        schema: {
            type: 'object',
            required: ['status'],
            properties: {
                status: { type: 'string', enum: ['interviewing', 'passed', 'rejected'] },
            },
        },
    }),
    ApiResponse({
        status: 200, description: 'Chuyển trạng thái thành công', example: {
            success: true,
            message: "Chuyển trạng thái thành công",
            data: {
                props: {
                    id: 3,
                    jobId: 7,
                    studentId: 100,
                    cvUrl: "https://example.com/cv.pdf",
                    coverLetter: "I am very interested in this position because...",
                    status: "interviewing",
                    createdAt: "2026-04-09T01:45:25.096Z",
                    updatedAt: "2026-04-09T01:56:52.229Z"
                }
            }
        }
    }),
);
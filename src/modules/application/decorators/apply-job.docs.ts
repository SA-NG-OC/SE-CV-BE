import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

export const ApplyJobDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Nộp đơn ứng tuyển',
        description: 'Sinh viên nộp đơn vào một công việc cụ thể. Yêu cầu role STUDENT.',
    }),
    ApiBody({
        schema: {
            type: 'object',
            required: ['jobId', 'cvUrl'],
            properties: {
                jobId: { type: 'integer', example: 1 },
                cvUrl: { type: 'string', format: 'url', example: 'https://storage.com/my-cv.pdf' },
                coverLetter: { type: 'string', minLength: 20, example: 'Tôi rất ấn tượng với vị trí này...' },
            },
        },
    }),
    ApiResponse({
        status: 201, description: 'Nộp đơn ứng tuyển thành công', example: {
            success: true,
            message: "Nộp đơn ứng tuyển thành công",
            data: {
                props: {
                    id: 3,
                    jobId: 7,
                    studentId: 100,
                    cvUrl: "https://example.com/cv.pdf",
                    coverLetter: "I am very interested in this position because...",
                    status: "submitted",
                    createdAt: "2026-04-09T01:45:25.096Z",
                    updatedAt: "2026-04-09T01:45:25.096Z"
                }
            }
        }
    }),
);
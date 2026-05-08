import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

export function GetJobsByCategoryDocs() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Thống kê job theo category (Company)',
            description:
                'API dùng để hiển thị số lượng job của công ty theo từng danh mục (category), phục vụ biểu đồ phân bố công việc.',
        }),
        ApiOkResponse({
            description: 'Lấy thống kê job theo category thành công',
            example: {
                success: true,
                message: "Lấy thống kê job theo category thành công",
                data: [
                    {
                        categoryId: 1,
                        categoryName: "Khác",
                        jobs: [
                            {
                                jobId: 101,
                                jobTitle: "Backend Developer (Node.js)",
                            },
                            {
                                jobId: 100,
                                jobTitle: "Frontend Developer (React)",
                            },
                        ],
                    },
                    {
                        categoryId: 102,
                        categoryName: "DevOps & Cloud",
                        jobs: [
                            {
                                jobId: 3,
                                jobTitle: "Devops",
                            },
                        ],
                    },
                    {
                        categoryId: 104,
                        categoryName: "UI/UX Design",
                        jobs: [
                            {
                                jobId: 102,
                                jobTitle: "UI/UX Designer",
                            },
                        ],
                    },
                ],
            }
        }),
    );
}
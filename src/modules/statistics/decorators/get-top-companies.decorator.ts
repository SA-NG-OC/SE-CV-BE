import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

export function GetTopCompaniesDocs() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Top công ty có nhiều job nhất',
            description:
                'API dùng cho admin để lấy danh sách top 5 công ty có số lượng tin tuyển dụng nhiều nhất trong hệ thống.',
        }),
        ApiOkResponse({
            description: 'Lấy top công ty thành công',
            example: {
                success: true,
                message: "Lấy top 5 công ty có nhiều tin tuyển dụng nhất thành công",
                data: [
                    {
                        companyId: 100,
                        companyName: "Tech Solutions Vietnam",
                        totalJobs: 4,
                    },
                    {
                        companyId: 101,
                        companyName: "FPT Software",
                        totalJobs: 4,
                    },
                    {
                        companyId: 103,
                        companyName: "Tiki Corporation",
                        totalJobs: 4,
                    },
                    {
                        companyId: 104,
                        companyName: "MoMo (M_Service)",
                        totalJobs: 4,
                    },
                    {
                        companyId: 102,
                        companyName: "VNG Corporation",
                        totalJobs: 3,
                    },
                ],
            }
        }),
    );
}
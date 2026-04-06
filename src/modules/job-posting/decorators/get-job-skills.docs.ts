import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';

export const GetJobSkillsDocs = () => applyDecorators(
    ApiOperation({
        summary: 'Lấy danh sách kỹ năng',
        description: 'Trả về toàn bộ kỹ năng dùng cho form đăng tuyển. Không yêu cầu xác thực.',
    }),
    ApiOkResponse({
        description: 'Lấy danh sách kỹ năng thành công',
        example: {
            success: true,
            message: "Lấy thông tin thành công",
            data: [
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
    }),
);
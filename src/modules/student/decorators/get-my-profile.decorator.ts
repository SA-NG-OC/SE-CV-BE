// decorators/get-my-profile.decorator.ts
import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiOkResponse,
} from '@nestjs/swagger';

const GetMyProfileDocs = () =>
    applyDecorators(
        HttpCode(HttpStatus.OK),
        ApiBearerAuth('access-token'),
        ApiOperation({
            summary: 'Lấy thông tin cá nhân',
            description: 'Lấy thông tin profile của sinh viên hiện tại. Yêu cầu quyền STUDENT.',
        }),
        ApiOkResponse({
            description: 'Lấy profile thành công',
            schema: {
                example: {
                    success: true,
                    message: "Lấy profile thành công",
                    data: {
                        studentId: 100,
                        fullName: "Nguyễn Văn A",
                        avatarUrl: null,
                        currentYear: 4,
                        gpa: "3.45",
                        isOpenToWork: true,
                        skills: [
                            { skillId: 1, skillName: "React" },
                            { skillId: 2, skillName: "Node.js" },
                            { skillId: 3, skillName: "TypeScript" }
                        ],
                        resumes: [
                            {
                                resumeId: 1,
                                resumeName: "Le Van An",
                                cvUrl: "https://www.youtube.com/watch?v=leJb3VhQCrg&list=RD6Lrb6Yf21m8&index=5",
                                isDefault: true
                            },
                            {
                                resumeId: 2,
                                resumeName: "Le Van An Pro",
                                cvUrl: "https://www.youtube.com/watch?v=leJb3VhQCrg&list=RD6Lrb6Yf21m8&index=5",
                                isDefault: false
                            }
                        ]
                    }
                }
            },
        }),
    );

export default GetMyProfileDocs;
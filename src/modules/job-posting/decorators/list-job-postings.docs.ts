import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export const ListJobPostingsDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Lấy danh sách tin tuyển dụng dạng card',
        description: [
            'Trả về danh sách tin tuyển dụng có phân trang và bộ lọc. Yêu cầu đăng nhập.',
            '**ADMIN & COMPANY**: có thêm `status`, `applicationDeadline`, `createdAt`, `companyName`, `logoUrl`.',
            '**STUDENT**: có thêm `companyId`, `companyName`, `logoUrl`, `postedAt` — không có `status`.',
            '**COMPANY**: chỉ trả về tin của công ty đó.',
        ].join('\n\n'),
    }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Tối đa 50' }),
    ApiQuery({ name: 'search', required: false, type: String, example: 'Frontend Developer' }),
    ApiQuery({
        name: 'status',
        required: false,
        enum: ['pending', 'approved', 'rejected', 'restricted'],
        description: 'Lọc theo trạng thái (ADMIN & COMPANY)',
    }),
    ApiQuery({ name: 'city', required: false, type: String, example: 'Hồ Chí Minh' }),

    ApiResponse({
        status: 200,
        description: 'Lấy danh sách thành công. Dữ liệu trả về khác nhau theo role — chọn example bên dưới để xem.',
        content: {
            'application/json': {
                examples: {
                    ADMIN: {
                        summary: '✅ ADMIN — có companyName, logoUrl, status, applicationDeadline, createdAt',
                        value: {
                            success: true,
                            message: 'Lấy thông tin thành công',
                            data: {
                                data: [
                                    {
                                        jobId: 8,
                                        companyName: 'TechNova Solutions',
                                        logoUrl: 'https://res.cloudinary.com/deagejli9/image/upload/v1775297599/nest_uploads/lfhhh3dlsvqatwmyibt5.png',
                                        jobTitle: 'Frontend Developer Intern 3.0',
                                        city: 'HCM',
                                        salaryMin: 3000000,
                                        salaryMax: 3000000,
                                        salaryType: 'RANGE',
                                        isSalaryNegotiable: false,
                                        applicationDeadline: '2026-07-01',
                                        status: 'pending',
                                        applicantCount: 0,
                                        skills: [
                                            { skillId: 1, skillName: 'React' },
                                            { skillId: 2, skillName: 'Node.js' },
                                            { skillId: 3, skillName: 'TypeScript' },
                                        ],
                                        createdAt: '2026-04-06T02:05:19.350Z',
                                    },
                                    {
                                        jobId: 7,
                                        companyName: 'TechNova Solutions',
                                        logoUrl: 'https://res.cloudinary.com/deagejli9/image/upload/v1775297599/nest_uploads/lfhhh3dlsvqatwmyibt5.png',
                                        jobTitle: 'Hahahahahahahahahaha',
                                        city: null,
                                        salaryMin: null,
                                        salaryMax: null,
                                        salaryType: null,
                                        isSalaryNegotiable: true,
                                        applicationDeadline: '2026-04-11',
                                        status: 'rejected',
                                        applicantCount: 0,
                                        skills: [],
                                        createdAt: '2026-04-06T01:32:00.535Z',
                                    },
                                ],
                                meta: { currentPage: 1, itemsPerPage: 10, totalItems: 2, totalPages: 1 },
                            }
                        },
                    },
                    COMPANY: {
                        summary: '✅ COMPANY — chỉ tin của công ty mình, có companyName, logoUrl, status, applicationDeadline, createdAt',
                        value: {
                            success: true,
                            message: 'Lấy thông tin thành công',
                            data: {
                                data: [
                                    {
                                        jobId: 8,
                                        companyName: 'TechNova Solutions',
                                        logoUrl: 'https://res.cloudinary.com/deagejli9/image/upload/v1775297599/nest_uploads/lfhhh3dlsvqatwmyibt5.png',
                                        jobTitle: 'Frontend Developer Intern 3.0',
                                        city: 'HCM',
                                        salaryMin: 3000000,
                                        salaryMax: 3000000,
                                        salaryType: 'RANGE',
                                        isSalaryNegotiable: false,
                                        applicationDeadline: '2026-07-01',
                                        status: 'approved',
                                        applicantCount: 0,
                                        skills: [
                                            { skillId: 1, skillName: 'React' },
                                            { skillId: 2, skillName: 'Node.js' },
                                            { skillId: 3, skillName: 'TypeScript' },
                                        ],
                                        createdAt: '2026-04-06T02:05:19.350Z',
                                    },
                                ],
                                meta: { currentPage: 1, itemsPerPage: 10, totalItems: 1, totalPages: 1 },
                            }
                        },
                    },
                    STUDENT: {
                        summary: '✅ STUDENT — có companyId, companyName, logoUrl, postedAt; không có status',
                        value: {
                            success: true,
                            message: 'Lấy thông tin thành công',
                            data: {
                                data: [
                                    {
                                        jobId: 8,
                                        companyId: 7,
                                        companyName: 'TechNova Solutions',
                                        logoUrl: 'https://res.cloudinary.com/deagejli9/image/upload/v1775297599/nest_uploads/lfhhh3dlsvqatwmyibt5.png',
                                        jobTitle: 'Frontend Developer Intern 3.0',
                                        city: 'HCM',
                                        salaryMin: 3000000,
                                        salaryMax: 3000000,
                                        salaryType: 'RANGE',
                                        isSalaryNegotiable: false,
                                        postedAt: 'Hôm nay',
                                        applicantCount: 0,
                                        skills: [
                                            { skillId: 1, skillName: 'React' },
                                            { skillId: 2, skillName: 'Node.js' },
                                            { skillId: 3, skillName: 'TypeScript' },
                                        ],
                                    },
                                ],
                                meta: { currentPage: 1, itemsPerPage: 10, totalItems: 1, totalPages: 1 },
                            }
                        },
                    },
                },
            },
        },
    }),
);
import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

export const GetJobSaveDocs = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary:
        'Lấy danh sách tin tuyển dụng dạng card mà student đang lưu (ROLE student)',
      description: [
        'Trả về danh sách tin tuyển dụng có phân trang và bộ lọc. Yêu cầu đăng nhập.',
      ].join('\n\n'),
    }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 10,
      description: 'Tối đa 50',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      example: 'Frontend Developer',
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: ['pending', 'approved', 'rejected', 'restricted'],
      description: 'Lọc theo trạng thái (ADMIN & COMPANY)',
    }),
    ApiQuery({
      name: 'city',
      required: false,
      type: String,
      example: 'Hồ Chí Minh',
    }),

    ApiResponse({
      status: 200,
      description:
        'Lấy danh sách thành công. Dữ liệu trả về khác nhau theo role — chọn example bên dưới để xem.',
      content: {
        'application/json': {
          example: {
            success: true,
            message: 'Lấy danh sách job đã lưu thành công',
            data: {
              data: [
                {
                  jobId: 107,
                  companyId: 102,
                  companyName: 'VNG Corporation',
                  logoUrl: null,
                  jobTitle: 'Backend Engineer (Go/Python)',
                  city: 'TP.HCM',
                  salaryMin: 25000000,
                  salaryMax: 45000000,
                  salaryType: 'monthly',
                  isSalaryNegotiable: true,
                  postedAt: '1 tuần trước',
                  applicantCount: 1,
                  skills: [
                    { skillId: 103, skillName: 'Python' },
                    { skillId: 111, skillName: 'Redis' },
                  ],
                  saved: true,
                },
                {
                  jobId: 114,
                  companyId: 104,
                  companyName: 'MoMo (M_Service)',
                  logoUrl: null,
                  jobTitle: 'Backend Engineer (Golang)',
                  city: 'TP.HCM',
                  salaryMin: 20000000,
                  salaryMax: 40000000,
                  salaryType: 'monthly',
                  isSalaryNegotiable: true,
                  postedAt: '1 tuần trước',
                  applicantCount: 0,
                  skills: [
                    { skillId: 109, skillName: 'PostgreSQL' },
                    { skillId: 111, skillName: 'Redis' },
                  ],
                  saved: true,
                },
              ],
              meta: {
                currentPage: 1,
                itemsPerPage: 10,
                totalItems: 2,
                totalPages: 1,
              },
            },
          },
        },
      },
    }),
  );

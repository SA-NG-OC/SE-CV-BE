import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// 1. Định nghĩa Base Schema để xác định cấu trúc dữ liệu chuẩn
const BaseJobPostingSchema = z.object({
    jobTitle: z
        .string()
        .min(5, 'Tiêu đề công việc phải có ít nhất 5 ký tự')
        .max(255, 'Tiêu đề công việc không được vượt quá 255 ký tự'),

    categoryId: z.coerce
        .number()
        .int()
        .positive('Category ID phải là số nguyên dương')
        .optional(),

    city: z
        .string()
        .max(100, 'Tên thành phố không được vượt quá 100 ký tự')
        .optional(),

    applicationDeadline: z
        .string()
        .datetime({ message: 'Ngày không hợp lệ' })
        .refine((d) => new Date(d) > new Date(), {
            message: 'Hạn chót phải là ngày trong tương lai',
        })
        .optional(),

    salaryMin: z.coerce
        .number()
        .int()
        .nonnegative('Lương tối thiểu phải >= 0')
        .optional()
        .nullable(),

    salaryMax: z.coerce
        .number()
        .int()
        .positive('Lương tối đa phải > 0')
        .optional()
        .nullable(),

    salaryType: z.enum(['FIXED', 'RANGE', 'NEGOTIABLE']).optional(),

    isSalaryNegotiable: z.boolean().default(false),

    numberOfPositions: z.coerce
        .number()
        .int()
        .min(1, 'Số lượng vị trí phải ít nhất 1')
        .default(1),

    jobDescription: z
        .string()
        .min(20, 'Mô tả công việc phải có ít nhất 20 ký tự'),

    requirements: z
        .string()
        .min(10, 'Yêu cầu ứng viên phải có ít nhất 10 ký tự'),

    benefits: z.string().optional(),

    experienceLevel: z
        .enum(['FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD', 'MANAGER'])
        .optional(),

    positionLevel: z
        .enum(['STAFF', 'TEAM_LEAD', 'SUPERVISOR', 'MANAGER', 'DIRECTOR', 'C_LEVEL'])
        .optional(),

    skillIds: z
        .array(z.coerce.number().int().positive())
        .min(1, 'Phải có ít nhất 1 kỹ năng yêu cầu')
        .optional(),

    isUrgent: z.boolean().default(false),
});

// 2. Tạo Schema hoàn chỉnh với Preprocess và Refine
export const CreateJobPostingSchema = z
    .preprocess((input: any) => {
        if (input && (input.isSalaryNegotiable === true || input.isSalaryNegotiable === 'true')) {
            return {
                ...input,
                salaryMin: null,
                salaryMax: null,
                salaryType: 'NEGOTIABLE',
            };
        }
        return input;
    }, BaseJobPostingSchema)
    .refine(
        (data) => {
            if (
                data.salaryMin !== null && data.salaryMin !== undefined &&
                data.salaryMax !== null && data.salaryMax !== undefined
            ) {
                return data.salaryMax >= data.salaryMin;
            }
            return true;
        },
        {
            message: 'Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu',
            path: ['salaryMax'],
        },
    );

export class CreateJobPostingDto extends createZodDto(CreateJobPostingSchema) { }
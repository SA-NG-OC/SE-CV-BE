import { z } from "zod";
import { createZodDto } from "nestjs-zod";

// 1. DTO Cập nhật trạng thái việc làm
export const updateJobStatusSchema = z.object({
    isOpenToWork: z.boolean({
        message: 'Trạng thái không hợp lệ'
    }),
});
export class UpdateJobStatusDto extends createZodDto(updateJobStatusSchema) { }

// 2. DTO Cập nhật danh sách kỹ năng
export const updateSkillsSchema = z.object({
    skillIds: z.array(z.number().int().positive()).default([]),
});
export class UpdateSkillsDto extends createZodDto(updateSkillsSchema) { }

// 3. DTO Thêm mới CV
export const createResumeSchema = z.object({
    resumeName: z.string().min(1, "Tên CV không được để trống"),
    cvUrl: z.url({
        message: "Đường dẫn cv không hợp lệ"
    }),
    //isDefault: z.boolean().default(false),
});
export class CreateResumeDto extends createZodDto(createResumeSchema) { }

// 4. Cập nhật ảnh đại diện
export const updateAvatarSchema = z.object({
    avatarUrl: z
        .string({ message: 'Đường dẫn ảnh phải là chuỗi ký tự' })
        .url({ message: 'Đường dẫn ảnh không đúng định dạng URL' })
        .max(500, { message: 'Đường dẫn ảnh không quá 500 ký tự' }),
});

export class UpdateAvatarDto extends createZodDto(updateAvatarSchema) { }

// 5. DTO cho Cập nhật Thông tin cơ bản (Full name & Email)
export const updateGeneralInfoSchema = z.object({
    fullName: z
        .string({ message: 'Họ và tên phải là chuỗi ký tự' })
        .min(1, { message: 'Họ và tên không được để trống' })
        .max(255),

    email: z
        .string({ message: 'Email không đúng định dạng' })
        .email({ message: 'Email không hợp lệ' })
        .max(255),

    phoneNumber: z
        .string({ message: 'Số điện thoại phải là chuỗi' })
        .regex(/^[0-9]{9,11}$/, { message: 'Số điện thoại không hợp lệ' })
        .optional(),
});

export class UpdateGeneralInfoDto extends createZodDto(updateGeneralInfoSchema) { }

// 6. DTO cho update preference
export const updateJobPreferenceSchema = z.object({
    desiredSalaryMin: z
        .number({ message: 'Mức lương tối thiểu phải là số' })
        .int({ message: 'Mức lương tối thiểu phải là số nguyên' })
        .min(0, { message: 'Mức lương tối thiểu không được nhỏ hơn 0' })
        .optional(),

    desiredSalaryMax: z
        .number({ message: 'Mức lương tối đa phải là số' })
        .int({ message: 'Mức lương tối đa phải là số nguyên' })
        .min(0, { message: 'Mức lương tối đa không được nhỏ hơn 0' })
        .optional(),

    desiredLocation: z
        .string({ message: 'Địa điểm mong muốn phải là chuỗi' })
        .max(255, { message: 'Địa điểm không được vượt quá 255 ký tự' })
        .optional(),
});

export class UpdateJobPreferenceDto extends createZodDto(updateJobPreferenceSchema) { }
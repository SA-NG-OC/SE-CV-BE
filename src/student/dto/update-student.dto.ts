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
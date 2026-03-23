// decorators/student-profile.decorator.ts
import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiOkResponse,
    ApiCreatedResponse,
    ApiConsumes,
    ApiParam
} from '@nestjs/swagger';
import { UpdateJobStatusDto } from '../dto/update-student.dto';
import { UpdateSkillsDto } from '../dto/update-student.dto';

// 1. Decorator cho Cập nhật trạng thái việc làm
export const UpdateJobStatusDocs = () => applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiBearerAuth('access-token'),
    ApiOperation({
        summary: 'Cập nhật trạng thái tìm việc',
        description: 'Yêu cầu `Bearer Token` (Role: STUDENT). Bật/tắt trạng thái đang tìm kiếm việc làm của sinh viên.',
    }),
    ApiBody({ type: UpdateJobStatusDto }),
    ApiOkResponse({
        description: 'Cập nhật thông tin thành công.',
        schema: { example: { success: true, message: 'Cập nhật thông tin thành công', data: { message: "Cập nhật trạng thái tìm việc thành công" } } },
    }),
);

// 2. Decorator cho Cập nhật Kỹ năng
export const UpdateSkillsDocs = () => applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiBearerAuth('access-token'),
    ApiOperation({
        summary: 'Cập nhật danh sách kỹ năng',
        description: 'Yêu cầu `Bearer Token` (Role: STUDENT). Gửi lên mảng ID các kỹ năng. Dữ liệu cũ sẽ bị ghi đè hoàn toàn bởi danh sách mới này.',
    }),
    ApiBody({ type: UpdateSkillsDto }),
    ApiOkResponse({
        description: 'Cập nhật thông tin thành công.',
        schema: {
            example: {
                success: true,
                message: "Cập nhật thông tin thành công",
                data: {
                    message: "Cập nhật danh sách kỹ năng thành công"
                }
            }
        },
    }),
);

// 3. Decorator cho Upload CV (multipart/form-data)
export const UploadResumeDocs = () => applyDecorators(
    HttpCode(HttpStatus.CREATED),
    ApiBearerAuth('access-token'),
    ApiOperation({
        summary: 'Upload CV mới (PDF)',
        description: 'Yêu cầu `Bearer Token` (Role: STUDENT). Upload file PDF tối đa 5MB.',
    }),
    ApiConsumes('multipart/form-data'), // Bắt buộc để Swagger hiện nút upload file
    ApiBody({
        schema: {
            type: 'object',
            required: ['cvFile'],
            properties: {
                cvFile: {
                    type: 'string',
                    format: 'binary',
                    description: 'File CV định dạng PDF (Max 5MB)',
                },
                resumeName: {
                    type: 'string',
                    description: 'Tên hiển thị của CV (Tùy chọn, mặc định lấy tên gốc của file)',
                },
            },
        },
    }),
    ApiCreatedResponse({
        description: 'Thêm mới CV thành công.',
        schema: {
            example: {
                success: true,
                message: "Thêm mới CV thành công",
                data: {
                    message: "Thêm CV mới thành công",
                    data: {
                        resume_id: 10,
                        student_id: 1,
                        resume_name: "CV___Đỗ_Thanh_Liêm (2).pdf",
                        cv_url: "https://res.cloudinary.com/deagejli9/image/upload/v1774259163/se_cv_resumes/izlmdhg6vuzdhsishreo.pdf",
                        is_default: false,
                        created_at: "2026-03-23T16:46:05.051Z"
                    }
                }
            }
        },
    }),
);

// 4. Decorator cho Đặt CV mặc định
export const SetDefaultResumeDocs = () => applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiBearerAuth('access-token'),
    ApiOperation({
        summary: 'Đặt CV làm mặc định',
        description: 'Yêu cầu `Bearer Token` (Role: STUDENT). Chọn một CV có sẵn làm CV mặc định dùng để ứng tuyển.',
    }),
    ApiParam({
        name: 'resumeId',
        type: 'number',
        description: 'ID của CV muốn đặt làm mặc định',
        example: 1,
    }),
    ApiOkResponse({
        description: 'Cập nhật thông tin thành công.',
        schema: {
            example: {
                success: true,
                message: "Cập nhật thông tin thành công",
                data: {
                    message: "Đã cập nhật CV mặc định",
                    data: {
                        resume_id: 3,
                        student_id: 1,
                        resume_name: "Tran Anh Tuan.pdf",
                        cv_url: "https://res.cloudinary.com/deagejli9/image/upload/v1774255621/se_cv_resumes/vszziwfvqv9nim1pl0z6.pdf",
                        is_default: true,
                        created_at: "2026-03-23T15:47:02.972Z"
                    }
                }
            }
        },
    }),
);
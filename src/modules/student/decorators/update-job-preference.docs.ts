import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiBody,
    ApiNoContentResponse,
} from '@nestjs/swagger';
import { UpdateJobPreferenceDto } from '../dto/update-student.dto';

const UpdateJobPreferenceDocs = () =>
    applyDecorators(
        HttpCode(HttpStatus.NO_CONTENT),
        ApiBearerAuth('access-token'),
        ApiOperation({
            summary: 'Cập nhật nguyện vọng công việc',
            description:
                'Cập nhật mức lương mong muốn và địa điểm làm việc của sinh viên. Yêu cầu quyền STUDENT.',
        }),
        ApiBody({
            type: UpdateJobPreferenceDto,
            examples: {
                full: {
                    summary: 'Cập nhật đầy đủ',
                    value: {
                        desiredSalaryMin: 1000,
                        desiredSalaryMax: 2000,
                        desiredLocation: 'Ho Chi Minh City',
                    },
                },
                partial: {
                    summary: 'Cập nhật một phần',
                    value: {
                        desiredSalaryMin: 1500,
                    },
                },
            },
        }),
        ApiNoContentResponse({
            description: 'Cập nhật thành công (không trả về dữ liệu)',
        }),
    );

export default UpdateJobPreferenceDocs;
import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
} from '@nestjs/swagger';

const GetJobPreferenceDocs = () =>
    applyDecorators(
        HttpCode(HttpStatus.OK),

        ApiBearerAuth('access-token'),

        ApiOperation({
            summary: 'Lấy job preference',
            description:
                'Lấy thông tin mong muốn công việc của sinh viên hiện tại. Yêu cầu quyền STUDENT.',
        }),

        ApiOkResponse({
            description: 'Lấy job preference thành công',

            schema: {
                example: {
                    success: true,
                    message: 'Lấy thông tin job preference thành công',

                    data: {
                        desiredSalaryMin: 1000,
                        desiredSalaryMax: 3000,
                        desiredLocation: 'Ho Chi Minh City',
                    },
                },
            },
        }),
    );

export default GetJobPreferenceDocs;
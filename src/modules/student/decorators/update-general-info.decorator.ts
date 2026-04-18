// decorators/update-general-info.decorator.ts
import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiBody,
    ApiOkResponse,
} from '@nestjs/swagger';
import { UpdateGeneralInfoDto } from '../dto/update-student.dto';


const UpdateGeneralInfoDocs = () =>
    applyDecorators(
        HttpCode(HttpStatus.OK),
        ApiBearerAuth('access-token'),
        ApiOperation({
            summary: 'Cập nhật thông tin cá nhân',
            description: 'Cập nhật họ tên và email của sinh viên. Yêu cầu quyền STUDENT.',
        }),
        ApiBody({
            type: UpdateGeneralInfoDto,
        }),
        ApiOkResponse({
            description: 'Cập nhật thông tin thành công',
            schema: {
                example: {} // tự điền
            },
        }),
    );

export default UpdateGeneralInfoDocs;
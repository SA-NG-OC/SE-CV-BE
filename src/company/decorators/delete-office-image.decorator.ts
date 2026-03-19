// decorators/delete-office-image.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { SimpleSuccessResponse } from './company-swagger.response';

const DeleteOfficeImageDocs = () =>
    applyDecorators(
        ApiBearerAuth('access-token'),
        ApiOperation({
            summary: 'Xóa ảnh văn phòng',
            description: 'Yêu cầu đăng nhập. Chỉ xóa được ảnh thuộc về công ty của chính mình.',
        }),
        ApiParam({ name: 'imageId', type: Number, description: 'ID của ảnh văn phòng cần xóa' }),
        ApiOkResponse({ description: 'Xóa ảnh thành công.', type: SimpleSuccessResponse }),
    );

export default DeleteOfficeImageDocs;
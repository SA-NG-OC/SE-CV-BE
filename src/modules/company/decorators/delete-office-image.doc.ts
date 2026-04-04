import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiParam } from '@nestjs/swagger';

export const DeleteOfficeImageDocs = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Xóa ảnh văn phòng',
        description: 'Xóa một ảnh văn phòng theo ID. Chỉ được xóa ảnh thuộc công ty của mình.',
    }),
    ApiParam({
        name: 'imageId',
        type: Number,
        description: 'ID của ảnh văn phòng cần xóa',
        example: 5,
    }),
    ApiOkResponse({
        description: 'Xóa ảnh thành công',
        example: {
            success: true,
            message: 'Xóa ảnh thành công',
            data: {},
        },
    }),
);
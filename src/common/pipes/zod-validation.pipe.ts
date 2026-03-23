import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";
import { ZodType } from "zod";

export class ZodValidationPipe implements PipeTransform {
    constructor() { }

    transform(value: any, metadata: ArgumentMetadata) {
        const { metatype } = metadata;

        const schema = (metatype as any)?.schema;
        if (!schema) return value;

        const result = schema.safeParse(value);

        if (!result.success) {
            throw new BadRequestException({
                message: 'Dữ liệu đầu vào không hợp lệ',
                errors: result.error.issues
            });
        }

        return result.data;
    }
}
import { z } from "zod";
import { createZodDto } from 'nestjs-zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
extendZodWithOpenApi(z);

export const getCompanyParamSchema = z.object({
    companyId: z
        .string()
        .regex(/^\d+$/, { message: 'companyId phải là số nguyên dương' })
        .transform(Number)
        .openapi({ example: '1' }),
});

export class GetCompanyParamDto extends createZodDto(getCompanyParamSchema) { }
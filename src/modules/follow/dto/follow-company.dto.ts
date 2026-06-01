// follow-company.dto.ts
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const FollowCompanyParamSchema = z.object({
  companyId: z.coerce.number().int().positive(),
});

export class FollowCompanyParamDto extends createZodDto(
  FollowCompanyParamSchema,
) {}

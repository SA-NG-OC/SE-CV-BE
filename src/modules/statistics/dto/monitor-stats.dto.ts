import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const DashboardStatsSchema = z.object({
  totalCompanies: z.number(),
  avgRating: z.number(),
  totalApplications: z.number(),
  totalPassed: z.number(),
});

export class DashboardStatsResponseDto extends createZodDto(
  DashboardStatsSchema,
) {}

import { Module } from '@nestjs/common';
import { JobCategoryController } from './category.controller';
import { JobCategoryService } from './category.service';
import { JobCategoryRepository } from './repositories/job-category.repository';

@Module({
  controllers: [JobCategoryController],
  providers: [
    JobCategoryService,
    {
      provide: 'I_JOB_CATEGORY_REPOSITORY',
      useClass: JobCategoryRepository,
    },
  ],
})
export class CategoryModule { }
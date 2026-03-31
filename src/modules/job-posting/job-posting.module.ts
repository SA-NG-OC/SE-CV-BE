import { Module } from '@nestjs/common';
import { JobPostingService } from './job-posting.service';
import { JobPostingController } from './job-posting.controller';
import { I_JOB_POSTING_REPOSITORY } from './job-posting.tokens';
import { AuthModule } from 'src/modules/auth/auth.module';
import { JobPostingRepository } from './repositories/job-posting.repository';

@Module({
  imports: [AuthModule],
  controllers: [JobPostingController],
  providers: [
    JobPostingService,
    {
      provide: I_JOB_POSTING_REPOSITORY,
      useClass: JobPostingRepository,
    },
  ],
  exports: [I_JOB_POSTING_REPOSITORY],
})
export class JobPostingModule { }
